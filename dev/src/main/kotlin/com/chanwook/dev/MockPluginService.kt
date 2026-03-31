package com.chanwook.dev

import com.chanwook.app.service.PluginInfo
import com.chanwook.app.service.PluginService

class MockPluginService : PluginService {
    private val plugins = mutableListOf(
        PluginInfo(name = "EssentialsX", version = "2.20.1", enabled = true, description = "Essential commands for Bukkit", authors = listOf("EssentialsX Team")),
        PluginInfo(name = "WorldEdit", version = "7.3.0", enabled = true, description = "World editing toolkit", authors = listOf("EngineHub")),
        PluginInfo(name = "Vault", version = "1.7.3", enabled = false, description = "Economy, permissions & chat API", authors = listOf("MilkBowl")),
        PluginInfo(name = "LuckPerms", version = "5.4.102", enabled = true, description = "Permission management", authors = listOf("Luck")),
        PluginInfo(name = "Ktulu", version = "0.1.0", enabled = true, description = "Web-based server management", authors = listOf("Chanwook Lee")),
    )

    override fun listPlugins(): List<PluginInfo> = plugins.toList()

    override fun togglePlugin(name: String): PluginInfo? {
        val index = plugins.indexOfFirst { it.name.equals(name, ignoreCase = true) }
        if (index == -1) return null
        plugins[index] = plugins[index].copy(enabled = !plugins[index].enabled)
        return plugins[index]
    }

    override fun unloadPlugin(name: String): Boolean {
        return plugins.removeIf { it.name.equals(name, ignoreCase = true) }
    }

    override fun loadPlugin(fileName: String): PluginInfo? {
        val info = PluginInfo(
            name = fileName.removeSuffix(".jar"),
            version = "1.0.0",
            enabled = true,
            description = "Loaded from $fileName",
            authors = emptyList(),
        )
        plugins.add(info)
        return info
    }

    override fun removePlugin(name: String): Boolean {
        return plugins.removeIf { it.name.equals(name, ignoreCase = true) }
    }
}
