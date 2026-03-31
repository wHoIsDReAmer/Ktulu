package com.chanwook.app.server

import com.chanwook.app.common.Logger
import com.chanwook.app.server.console.consoleRoutes
import com.chanwook.app.server.file.fileRoutes
import com.chanwook.app.server.marketplace.marketplaceRoutes
import com.chanwook.app.server.plugin.pluginRoutes
import com.chanwook.app.server.system.systemRoutes
import com.chanwook.app.service.ConsoleService
import com.chanwook.app.service.FileService
import com.chanwook.app.service.MarketplaceService
import com.chanwook.app.service.PluginService
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import kotlinx.serialization.json.Json
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

class KtorServer(
    private val pluginService: PluginService,
    private val marketplaceService: MarketplaceService,
    private val fileService: FileService? = null,
    private val consoleService: ConsoleService? = null,
    private val apiKey: String? = null,
) {
    private var server: ApplicationEngine? = null
    private val requestCounts = ConcurrentHashMap<String, MutableList<Long>>()

    companion object {
        private const val RATE_LIMIT = 60
        private const val RATE_WINDOW_MS = 60_000L
    }

    fun startServer() {
        if (server != null) return

        server =
            embeddedServer(Netty, port = 8332) {
                install(ContentNegotiation) {
                    json(
                        Json {
                            prettyPrint = true
                            encodeDefaults = true
                        },
                    )
                }

                install(StatusPages) {
                    exception<Throwable> { call, cause ->
                        Logger.error("Unhandled error: ${call.request.local.uri}", cause)
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            mapOf("error" to (cause.message ?: "Unknown error")),
                        )
                    }
                }

                install(WebSockets) {
                    pingPeriod = Duration.ofSeconds(15)
                }

                intercept(ApplicationCallPipeline.Plugins) {
                    val ip = call.request.local.remoteAddress
                    val now = System.currentTimeMillis()
                    val timestamps = requestCounts.computeIfAbsent(ip) { mutableListOf() }
                    val limited =
                        synchronized(timestamps) {
                            timestamps.removeAll { it < now - RATE_WINDOW_MS }
                            if (timestamps.size >= RATE_LIMIT) {
                                true
                            } else {
                                timestamps.add(now)
                                false
                            }
                        }
                    if (limited) {
                        call.respond(HttpStatusCode.TooManyRequests, mapOf("error" to "Rate limit exceeded"))
                        finish()
                        return@intercept
                    }
                }

                if (apiKey != null) {
                    intercept(ApplicationCallPipeline.Plugins) {
                        val path = call.request.local.uri
                        if (path == "/auth/verify") return@intercept
                        val token =
                            call.request.headers["Authorization"]?.removePrefix("Bearer ")
                                ?: call.request.queryParameters["token"]
                        if (token != apiKey) {
                            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid API key"))
                            finish()
                        }
                    }
                }

                routing {
                    get("/auth/verify") {
                        val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                        if (apiKey == null || token == apiKey) {
                            call.respond(HttpStatusCode.OK, mapOf("authenticated" to true))
                        } else {
                            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
                        }
                    }
                    systemRoutes()
                    pluginRoutes(pluginService)
                    marketplaceRoutes(marketplaceService)
                    fileService?.let { fileRoutes(it) }
                    consoleService?.let { consoleRoutes(it) }
                }
            }.apply { start(wait = false) }
    }

    fun stopServer() {
        server?.stop(2000, 5000)
        server = null
    }
}
