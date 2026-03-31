package com.chanwook.dev

import com.chanwook.app.service.ConsoleService
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentLinkedDeque
import java.util.concurrent.CopyOnWriteArrayList
import kotlin.concurrent.thread

class MockConsoleService : ConsoleService {

    private val history = ConcurrentLinkedDeque<String>()
    private val listeners = CopyOnWriteArrayList<(String) -> Unit>()
    private val formatter = DateTimeFormatter.ofPattern("HH:mm:ss")

    private val mockMessages = listOf(
        "INFO" to "Server started on port 25565",
        "INFO" to "Loading world [world]",
        "INFO" to "Preparing spawn area: 100%",
        "INFO" to "Done (3.245s)! For help, type \"help\"",
        "INFO" to "Steve joined the game",
        "WARN" to "Can't keep up! Is the server overloaded?",
        "INFO" to "Alex joined the game",
        "INFO" to "Steve left the game",
    )

    fun start() {
        for (msg in mockMessages) {
            appendLog("[${LocalTime.now().format(formatter)} ${msg.first}]: ${msg.second}")
        }

        thread(isDaemon = true) {
            while (true) {
                Thread.sleep(5000)
                val time = LocalTime.now().format(formatter)
                appendLog("[$time INFO]: Server tick (mock)")
            }
        }
    }

    override fun getHistory(): List<String> = history.toList()

    override fun addListener(listener: (String) -> Unit): () -> Unit {
        listeners.add(listener)
        return { listeners.remove(listener) }
    }

    override fun dispatchCommand(command: String): Boolean {
        val time = LocalTime.now().format(formatter)
        appendLog("[$time INFO]: Executed command: /$command")
        return true
    }

    override fun appendLog(line: String) {
        history.addLast(line)
        while (history.size > 500) {
            history.pollFirst()
        }
        for (listener in listeners) {
            try {
                listener(line)
            } catch (_: Exception) {}
        }
    }
}
