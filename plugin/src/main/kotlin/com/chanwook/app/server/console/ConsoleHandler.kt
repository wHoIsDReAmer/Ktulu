package com.chanwook.app.server.console

import com.chanwook.app.common.Logger
import com.chanwook.app.service.ConsoleService
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.isActive

fun Route.consoleRoutes(consoleService: ConsoleService) {

    webSocket("/console") {
        Logger.info("WebSocket console client connected")

        // Send history
        for (line in consoleService.getHistory()) {
            if (!isActive) break
            send(Frame.Text(line))
        }

        // Register live listener
        val removeListener = consoleService.addListener { line ->
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
            removeListener()
            Logger.info("WebSocket console client disconnected")
        }
    }
}
