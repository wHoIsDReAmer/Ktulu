package com.chanwook.dev

import com.chanwook.app.service.PluginInfo
import com.chanwook.app.service.PluginService

class MockPluginService : PluginService {
    private val plugins = mutableListOf(
        PluginInfo("EssentialsX", "2.20.1", true, "Essential commands for Bukkit", listOf("EssentialsX Team")),
        PluginInfo("WorldEdit", "7.3.0", true, "World editing toolkit", listOf("EngineHub")),
        PluginInfo("Vault", "1.7.3", false, "Economy, permissions & chat API", listOf("MilkBowl")),
        PluginInfo("LuckPerms", "5.4.102", true, "Permission management", listOf("Luck")),
        PluginInfo("Ktulu", "0.1.0", true, "Web-based server management", listOf("Chanwook Lee"))
    )

    override fun listPlugins(): List<PluginInfo> = plugins.toList()

    override fun togglePlugin(name: String): PluginInfo? {
        val index = plugins.indexOfFirst { it.name.equals(name, ignoreCase = true) }
        if (index == -1) return null
        plugins[index] = plugins[index].copy(enabled = !plugins[index].enabled)
        return plugins[index]
    }

    override fun removePlugin(name: String): Boolean {
        return plugins.removeIf { it.name.equals(name, ignoreCase = true) }
    }
}
