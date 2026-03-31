package com.chanwook.app.common

object Logger {
    private const val PREFIX = "§5✦ §7Ktulu §f"
    private var output: (String) -> Unit = { println(it) }

    fun init(output: (String) -> Unit) {
        this.output = output
    }

    fun info(message: String) {
        output("$PREFIX$message")
    }

    fun warning(message: String) {
        output("$PREFIX§e$message")
    }

    fun error(message: String) {
        output("$PREFIX§c$message")
    }

    fun error(
        message: String,
        throwable: Throwable,
    ) {
        output("$PREFIX§c$message")
        output("$PREFIX§c${throwable.stackTraceToString()}")
    }

    fun debug(message: String) {
        output("$PREFIX§7$message")
    }
}
