package com.chanwook.app.server.system

import com.chanwook.app.common.Logger
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.lang.management.ManagementFactory
import kotlin.math.roundToInt

data class ServerStats(
    val tps: Double,
    val onlinePlayers: Int,
    val maxPlayers: Int,
    val serverVersion: String,
)

fun Route.systemRoutes(getServerStats: (() -> ServerStats)? = null) {
    get("/system-info") {
        try {
            val osBean =
                ManagementFactory.getOperatingSystemMXBean()
                    as com.sun.management.OperatingSystemMXBean
            val cpuUsage = (osBean.cpuLoad * 100).roundToInt().toDouble()

            val runtime = Runtime.getRuntime()
            val totalMemory = runtime.maxMemory() / (1024 * 1024)
            val usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)
            val uptime = ManagementFactory.getRuntimeMXBean().uptime / 1000

            val stats = getServerStats?.invoke()

            val root = File(".").canonicalFile
            val diskTotal = root.totalSpace / (1024 * 1024)
            val diskUsed = (root.totalSpace - root.usableSpace) / (1024 * 1024)

            val systemInfo =
                SystemInfo(
                    cpuUsage = cpuUsage,
                    memoryUsage = usedMemory,
                    totalMemory = totalMemory,
                    tps = stats?.tps ?: 20.0,
                    onlinePlayers = stats?.onlinePlayers ?: 0,
                    maxPlayers = stats?.maxPlayers ?: 0,
                    serverVersion = stats?.serverVersion ?: "",
                    uptime = uptime,
                    diskUsed = diskUsed,
                    diskTotal = diskTotal,
                )
            call.respond(HttpStatusCode.OK, systemInfo)
        } catch (e: Exception) {
            Logger.error("Error fetching system info", e)
            call.respond(HttpStatusCode.InternalServerError, "Error fetching system info")
        }
    }
}
