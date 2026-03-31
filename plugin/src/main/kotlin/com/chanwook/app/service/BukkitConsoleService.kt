package com.chanwook.app.service

import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.core.LogEvent
import org.apache.logging.log4j.core.Logger
import org.apache.logging.log4j.core.appender.AbstractAppender
import org.apache.logging.log4j.core.layout.PatternLayout
import org.bukkit.Bukkit
import java.util.concurrent.ConcurrentLinkedDeque
import java.util.concurrent.CopyOnWriteArrayList

class BukkitConsoleService : ConsoleService {
    private val history = ConcurrentLinkedDeque<String>()
    private val listeners = CopyOnWriteArrayList<(String) -> Unit>()
    private var appender: AbstractAppender? = null

    companion object {
        private const val MAX_HISTORY = 2000
    }

    fun start() {
        val layout =
            PatternLayout.newBuilder()
                .withPattern("[%d{HH:mm:ss} %level]: %msg%n")
                .build()

        appender =
            object : AbstractAppender("KtuluConsole", null, layout, false, emptyArray()) {
                override fun append(event: LogEvent) {
                    val line = String(layout.toByteArray(event)).trimEnd()
                    if (line.isNotEmpty()) {
                        appendLog(line)
                    }
                }
            }.also {
                it.start()
                (LogManager.getRootLogger() as Logger).addAppender(it)
            }
    }

    fun stop() {
        appender?.let {
            (LogManager.getRootLogger() as Logger).removeAppender(it)
            it.stop()
        }
        listeners.clear()
    }

    override fun getHistory(): List<String> = history.toList()

    override fun addListener(listener: (String) -> Unit): () -> Unit {
        listeners.add(listener)
        return { listeners.remove(listener) }
    }

    override fun dispatchCommand(command: String): Boolean {
        return try {
            Bukkit.getScheduler().callSyncMethod(
                Bukkit.getPluginManager().getPlugin("Ktulu")!!,
            ) {
                Bukkit.dispatchCommand(Bukkit.getConsoleSender(), command)
            }.get()
        } catch (e: Exception) {
            false
        }
    }

    override fun appendLog(line: String) {
        history.addLast(line)
        while (history.size > MAX_HISTORY) {
            history.pollFirst()
        }
        for (listener in listeners) {
            try {
                listener(line)
            } catch (_: Exception) {
            }
        }
    }
}
