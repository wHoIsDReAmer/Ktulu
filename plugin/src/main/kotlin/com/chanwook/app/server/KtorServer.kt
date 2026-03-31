package com.chanwook.app.server

import com.chanwook.app.common.Logger
import com.chanwook.app.server.marketplace.marketplaceRoutes
import com.chanwook.app.server.plugin.pluginRoutes
import com.chanwook.app.server.system.systemRoutes
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
import kotlinx.serialization.json.Json

class KtorServer(
    private val pluginService: PluginService,
    private val marketplaceService: MarketplaceService,
) {
    private var server: ApplicationEngine? = null

    fun startServer() {
        if (server != null) return

        server = embeddedServer(Netty, port = 8332) {
            install(ContentNegotiation) {
                json(Json { prettyPrint = true; encodeDefaults = true })
            }

            install(StatusPages) {
                exception<Throwable> { call, cause ->
                    Logger.error("Unhandled error: ${call.request.local.uri}", cause)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        mapOf("error" to (cause.message ?: "Unknown error"))
                    )
                }
            }

            routing {
                systemRoutes()
                pluginRoutes(pluginService)
                marketplaceRoutes(marketplaceService)
            }
        }.apply { start(wait = false) }
    }

    fun stopServer() {
        server?.stop(1000, 2000)
        server = null
    }
}
