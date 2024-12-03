package com.chanwook.app

import com.chanwook.app.common.Logger
import com.chanwook.app.server.KtorServer
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.bukkit.plugin.java.JavaPlugin

class Ktulu : JavaPlugin() {
    private var ktorServer: KtorServer? = null

    override fun onEnable() {
        Logger.info("플러그인이 활성화 되었습니다.")
        ktorServer = KtorServer()

        ktorServer?.startServer()
    }

    override fun onDisable() {
        Logger.info("§c플러그인이 비활성화 되었습니다.")
    }
}

fun main() {
    println("Hello World")
}
