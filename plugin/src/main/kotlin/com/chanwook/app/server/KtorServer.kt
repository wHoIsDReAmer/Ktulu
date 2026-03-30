package com.chanwook.app.server

import com.chanwook.app.server.plugin.pluginRoutes
import com.chanwook.app.server.system.systemRoutes
import com.chanwook.app.service.PluginService
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

class KtorServer(
    private val pluginService: PluginService
) {
    private var server: ApplicationEngine? = null

    fun startServer() {
        if (server != null) return

        server = embeddedServer(Netty, port = 8332) {
            install(ContentNegotiation) {
                json(Json { prettyPrint = true })
            }

            routing {
                systemRoutes()
                pluginRoutes(pluginService)
            }
        }.apply { start(wait = false) }
    }

    fun stopServer() {
        server?.stop(1000, 2000)
        server = null
    }
}
