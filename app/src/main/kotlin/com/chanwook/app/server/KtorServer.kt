package com.chanwook.app.server

import com.chanwook.app.server.system.systemRoutes
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

class KtorServer {
    private var server: ApplicationEngine? = null

    fun startServer() {
        if (server == null) {
            server = embeddedServer(Netty, port = 8332) {
                install(ContentNegotiation) {
                    // TODO: prod 환경에서는 false
                    json(Json { prettyPrint = true })
                }

                routing {
                    systemRoutes()
                }
            }.apply { start(wait = false )}
        }
    }

    fun stopServer() {
        if (server != null) {
            server!!.stop(5000, 5000)
        }
    }
}