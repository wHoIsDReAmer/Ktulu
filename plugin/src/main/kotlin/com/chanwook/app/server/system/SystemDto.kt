package com.chanwook.app.server.system

import kotlinx.serialization.Serializable

@Serializable
data class SystemInfo(
    val cpuUsage: Double,
    val memoryUsage: Long,
    val totalMemory: Long,
    val tps: Double = 20.0,
    val onlinePlayers: Int = 0,
    val maxPlayers: Int = 0,
    val serverVersion: String = "",
    val uptime: Long = 0,
    val diskUsed: Long = 0,
    val diskTotal: Long = 0,
)
