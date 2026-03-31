package com.chanwook.app.server.dashboard

import com.chanwook.app.common.Logger
import com.chanwook.app.service.ConsoleService
import com.chanwook.app.service.ServerService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class CommandRequest(val command: String)

fun Route.dashboardRoutes(
    serverService: ServerService?,
    consoleService: ConsoleService?,
) {
    get("/players") {
        if (serverService == null) {
            call.respond(HttpStatusCode.OK, emptyList<Unit>())
            return@get
        }
        try {
            call.respond(HttpStatusCode.OK, serverService.getOnlinePlayers())
        } catch (e: Exception) {
            Logger.error("Error fetching players", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error fetching players"))
        }
    }

    get("/worlds") {
        if (serverService == null) {
            call.respond(HttpStatusCode.OK, emptyList<Unit>())
            return@get
        }
        try {
            call.respond(HttpStatusCode.OK, serverService.getWorlds())
        } catch (e: Exception) {
            Logger.error("Error fetching worlds", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error fetching worlds"))
        }
    }

    post("/command") {
        if (consoleService == null) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Console not available"))
            return@post
        }
        try {
            val body = call.receive<CommandRequest>()
            val command = body.command.trim()
            if (command.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Empty command"))
                return@post
            }
            consoleService.dispatchCommand(command)
            call.respond(HttpStatusCode.OK, mapOf("message" to "Command executed"))
        } catch (e: Exception) {
            Logger.error("Error executing command", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error executing command"))
        }
    }

    get("/console/recent") {
        if (consoleService == null) {
            call.respond(HttpStatusCode.OK, emptyList<Unit>())
            return@get
        }
        try {
            val lines = call.request.queryParameters["lines"]?.toIntOrNull() ?: 50
            val capped = lines.coerceIn(1, 200)
            val history = consoleService.getHistory()
            val recent = history.takeLast(capped)
            call.respond(HttpStatusCode.OK, recent)
        } catch (e: Exception) {
            Logger.error("Error fetching recent logs", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error fetching logs"))
        }
    }
}
