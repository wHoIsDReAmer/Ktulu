package com.chanwook.app

import com.chanwook.app.common.Logger
import com.chanwook.app.server.KtorServer
import com.chanwook.app.service.BukkitConsoleService
import com.chanwook.app.service.BukkitFileService
import com.chanwook.app.service.BukkitPluginService
import com.chanwook.app.service.DefaultMarketplaceService
import org.bukkit.Bukkit
import org.bukkit.plugin.java.JavaPlugin

class Ktulu : JavaPlugin() {
    private var ktorServer: KtorServer? = null
    private var consoleService: BukkitConsoleService? = null

    override fun onEnable() {
        val console = Bukkit.getConsoleSender()
        Logger.init { console.sendMessage(it) }

        Logger.info("플러그인이 활성화 되었습니다.")

        consoleService = BukkitConsoleService().also { it.start() }
        val serverRoot = dataFolder.canonicalFile.parentFile.parentFile
        val fileService = BukkitFileService(serverRoot)
        ktorServer = KtorServer(BukkitPluginService(this), DefaultMarketplaceService(), fileService, consoleService)
        ktorServer?.startServer()
    }

    override fun onDisable() {
        ktorServer?.stopServer()
        ktorServer = null
        consoleService?.stop()
        consoleService = null
        Logger.info("§c플러그인이 비활성화 되었습니다.")
    }
}
