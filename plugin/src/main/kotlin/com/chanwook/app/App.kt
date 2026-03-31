package com.chanwook.app

import com.chanwook.app.common.Logger
import com.chanwook.app.server.KtorServer
import com.chanwook.app.server.system.ServerStats
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

        saveDefaultConfig()
        val apiKey = config.getString("api-key")?.takeIf { it.isNotBlank() }
        val reverseProxy = config.getBoolean("reverse-proxy", false)

        consoleService = BukkitConsoleService().also { it.start() }
        val serverRoot = dataFolder.canonicalFile.parentFile.parentFile
        val fileService = BukkitFileService(serverRoot)
        ktorServer =
            KtorServer(
                BukkitPluginService(this),
                DefaultMarketplaceService(),
                fileService,
                consoleService,
                {
                    ServerStats(
                        tps = Bukkit.getTPS()[0],
                        onlinePlayers = Bukkit.getOnlinePlayers().size,
                        maxPlayers = Bukkit.getMaxPlayers(),
                        serverVersion = Bukkit.getVersion(),
                    )
                },
                apiKey,
                reverseProxy,
            ) {
                reloadConfig()
                val newApiKey = config.getString("api-key")?.takeIf { it.isNotBlank() }
                val newReverseProxy = config.getBoolean("reverse-proxy", false)
                ktorServer?.updateConfig(newApiKey, newReverseProxy)
                Logger.info("Config reloaded")
            }
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
