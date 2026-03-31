package com.chanwook.app.service

import java.util.concurrent.ConcurrentLinkedDeque

interface ConsoleService {
    fun getHistory(): List<String>
    fun addListener(listener: (String) -> Unit): () -> Unit
    fun dispatchCommand(command: String): Boolean
    fun appendLog(line: String)
}
