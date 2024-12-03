package com.chanwook.app.server.system

import kotlinx.serialization.Serializable

@Serializable
data class SystemInfo(
    val cpuUsage: Double,
    val memoryUsage: Long,
    val totalMemory: Long
)
