package com.chanwook.app.server.system

import com.chanwook.app.common.Logger
import java.lang.management.ManagementFactory
import kotlin.math.roundToInt

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*


private fun getSystemInfo(): SystemInfo {
    val osBean = ManagementFactory.getOperatingSystemMXBean() as com.sun.management.OperatingSystemMXBean
    val totalMemory = osBean.totalMemorySize / (1024 * 1024)
    val freeMemory = osBean.freeMemorySize / (1024 * 1024)
    val cpuUsage = (osBean.cpuLoad * 100).roundToInt().toDouble()
    val usedMemory = totalMemory - freeMemory

    return SystemInfo(cpuUsage, usedMemory, totalMemory)
}

fun Route.systemRoutes() {
    get("/system-info") {
        try {
            val systemInfo = getSystemInfo()
            call.respond(HttpStatusCode.OK, systemInfo)
        } catch (e: Exception) {
            Logger.error("Error fetching system info", e)
            call.respond(HttpStatusCode.InternalServerError, "Error fetching system info")
        }
    }
}
