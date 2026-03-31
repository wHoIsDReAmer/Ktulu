package com.chanwook.app.server.console

import com.chanwook.app.common.Logger
import com.chanwook.app.service.ConsoleService
import io.ktor.server.application.ApplicationCall
import io.ktor.server.routing.Route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.CloseReason
import io.ktor.websocket.DefaultWebSocketSession
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readText
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.isActive
import java.util.Collections

val activeSessions: MutableSet<DefaultWebSocketSession> =
    Collections.synchronizedSet(mutableSetOf())

suspend fun closeAllSessions() {
    val sessions = synchronized(activeSessions) { activeSessions.toList() }
    for (session in sessions) {
        runCatching {
            session.close(CloseReason(CloseReason.Codes.GOING_AWAY, "Server shutting down"))
        }
    }
    activeSessions.clear()
}

fun Route.consoleRoutes(
    consoleService: ConsoleService,
    resolveIp: (ApplicationCall) -> String,
) {
    webSocket("/console") {
        activeSessions.add(this)
        val ip = resolveIp(call)
        Logger.info("WebSocket console client connected ($ip)")

        // Send history
        for (line in consoleService.getHistory()) {
            if (!isActive) break
            send(Frame.Text(line))
        }

        // Register live listener
        val removeListener =
            consoleService.addListener { line ->
                runCatching { outgoing.trySend(Frame.Text(line)) }
            }

        try {
            // Receive commands
            for (frame in incoming) {
                if (frame is Frame.Text) {
                    val command = frame.readText().trim()
                    if (command.isNotEmpty()) {
                        consoleService.dispatchCommand(command)
                    }
                }
            }
        } catch (_: ClosedReceiveChannelException) {
        } catch (_: CancellationException) {
        } catch (e: Exception) {
            Logger.error("WebSocket error", e)
        } finally {
            activeSessions.remove(this)
            removeListener()
            Logger.info("WebSocket console client disconnected ($ip)")
        }
    }
}
