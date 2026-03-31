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

class KtorServer(
    private val pluginService: PluginService,
    private val marketplaceService: MarketplaceService,
    private val fileService: FileService? = null,
    private val consoleService: ConsoleService? = null,
) {
    private var server: ApplicationEngine? = null

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

                routing {
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
