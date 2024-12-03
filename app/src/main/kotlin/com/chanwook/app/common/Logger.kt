package com.chanwook.app.common

import org.bukkit.Bukkit

object Logger {
    private val console = Bukkit.getConsoleSender()
    private const val PREFIX = "§5✦ §7Ktor §f"

    fun info(message: String) {
        console.sendMessage("$PREFIX$message")
    }

    fun warning(message: String) {
        console.sendMessage("$PREFIX§e$message")
    }

    fun error(message: String) {
        console.sendMessage("$PREFIX§c$message")
    }

    fun error(message: String, throwable: Throwable) {
        console.sendMessage("$PREFIX§c$message")
        console.sendMessage("$PREFIX§c${throwable.stackTraceToString()}")
    }

    fun debug(message: String) {
        console.sendMessage("$PREFIX§7$message")
    }
}
