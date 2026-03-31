package com.chanwook.app.server.player

import com.chanwook.app.common.Logger
import com.chanwook.app.service.ServerService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class PlayerActionRequest(
    val name: String,
    val reason: String = "",
)

@Serializable
data class GameModeRequest(
    val name: String,
    val mode: String,
)

@Serializable
data class TeleportRequest(
    val name: String,
    val target: String,
)

@Serializable
data class WhitelistActionRequest(val name: String)

@Serializable
data class WhitelistResponse(
    val enabled: Boolean,
    val players: List<String>,
)

fun Route.playerRoutes(serverService: ServerService) {
    post("/players/kick") {
        try {
            val body = call.receive<PlayerActionRequest>()
            val ok = serverService.kickPlayer(body.name, body.reason.ifEmpty { "Kicked by admin" })
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Player kicked"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player not found"))
            }
        } catch (e: Exception) {
            Logger.error("Error kicking player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error kicking player"))
        }
    }

    post("/players/ban") {
        try {
            val body = call.receive<PlayerActionRequest>()
            serverService.banPlayer(body.name, body.reason.ifEmpty { "Banned by admin" })
            call.respond(HttpStatusCode.OK, mapOf("message" to "Player banned"))
        } catch (e: Exception) {
            Logger.error("Error banning player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error banning player"))
        }
    }

    post("/players/unban") {
        try {
            val body = call.receive<PlayerActionRequest>()
            val ok = serverService.unbanPlayer(body.name)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Player unbanned"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player not banned"))
            }
        } catch (e: Exception) {
            Logger.error("Error unbanning player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error unbanning player"))
        }
    }

    post("/players/op") {
        try {
            val body = call.receive<PlayerActionRequest>()
            val ok = serverService.setOp(body.name, true)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Player opped"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player not found"))
            }
        } catch (e: Exception) {
            Logger.error("Error opping player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error opping player"))
        }
    }

    post("/players/deop") {
        try {
            val body = call.receive<PlayerActionRequest>()
            val ok = serverService.setOp(body.name, false)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Player deopped"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player not found"))
            }
        } catch (e: Exception) {
            Logger.error("Error deopping player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error deopping player"))
        }
    }

    post("/players/gamemode") {
        try {
            val body = call.receive<GameModeRequest>()
            val ok = serverService.setGameMode(body.name, body.mode)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Game mode changed"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player not found or invalid mode"))
            }
        } catch (e: Exception) {
            Logger.error("Error changing game mode", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error changing game mode"))
        }
    }

    post("/players/teleport") {
        try {
            val body = call.receive<TeleportRequest>()
            val ok = serverService.teleportPlayer(body.name, body.target)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Player teleported"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Player(s) not found"))
            }
        } catch (e: Exception) {
            Logger.error("Error teleporting player", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error teleporting"))
        }
    }

    get("/players/banned") {
        try {
            call.respond(HttpStatusCode.OK, serverService.getBannedNames())
        } catch (e: Exception) {
            Logger.error("Error fetching ban list", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error fetching ban list"))
        }
    }

    get("/whitelist") {
        try {
            call.respond(
                HttpStatusCode.OK,
                WhitelistResponse(
                    enabled = serverService.isWhitelistEnabled(),
                    players = serverService.getWhitelist(),
                ),
            )
        } catch (e: Exception) {
            Logger.error("Error fetching whitelist", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error fetching whitelist"))
        }
    }

    post("/whitelist/toggle") {
        try {
            val enabled = !serverService.isWhitelistEnabled()
            serverService.setWhitelistEnabled(enabled)
            call.respond(
                HttpStatusCode.OK,
                WhitelistResponse(
                    enabled = enabled,
                    players = serverService.getWhitelist(),
                ),
            )
        } catch (e: Exception) {
            Logger.error("Error toggling whitelist", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error toggling whitelist"))
        }
    }

    post("/whitelist/add") {
        try {
            val body = call.receive<WhitelistActionRequest>()
            val ok = serverService.addToWhitelist(body.name)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Added to whitelist"))
            } else {
                call.respond(HttpStatusCode.Conflict, mapOf("error" to "Already whitelisted"))
            }
        } catch (e: Exception) {
            Logger.error("Error adding to whitelist", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error adding to whitelist"))
        }
    }

    post("/whitelist/remove") {
        try {
            val body = call.receive<WhitelistActionRequest>()
            val ok = serverService.removeFromWhitelist(body.name)
            if (ok) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Removed from whitelist"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Not whitelisted"))
            }
        } catch (e: Exception) {
            Logger.error("Error removing from whitelist", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error removing from whitelist"))
        }
    }
}
