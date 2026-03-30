package com.chanwook.app.service

import org.bukkit.Bukkit
import java.io.File

class BukkitPluginService : PluginService {

    override fun listPlugins(): List<PluginInfo> {
        return Bukkit.getPluginManager().plugins.map { plugin ->
            PluginInfo(
                name = plugin.name,
                version = plugin.description.version,
                enabled = plugin.isEnabled,
                description = plugin.description.description ?: "",
                authors = plugin.description.authors
            )
        }
    }

    override fun togglePlugin(name: String): PluginInfo? {
        val plugin = Bukkit.getPluginManager().getPlugin(name) ?: return null
        val pm = Bukkit.getPluginManager()

        if (plugin.isEnabled) {
            pm.disablePlugin(plugin)
        } else {
            pm.enablePlugin(plugin)
        }

        return PluginInfo(
            name = plugin.name,
            version = plugin.description.version,
            enabled = plugin.isEnabled,
            description = plugin.description.description ?: "",
            authors = plugin.description.authors
        )
    }

    override fun removePlugin(name: String): Boolean {
        val plugin = Bukkit.getPluginManager().getPlugin(name) ?: return false
        val pm = Bukkit.getPluginManager()

        if (plugin.isEnabled) {
            pm.disablePlugin(plugin)
        }

        val pluginFile = File("plugins/${plugin.name}.jar")
        if (!pluginFile.exists()) {
            val pluginsDir = File("plugins")
            val matchingFile = pluginsDir.listFiles()?.firstOrNull {
                it.name.endsWith(".jar") && it.name.contains(plugin.name, ignoreCase = true)
            }
            return matchingFile?.delete() ?: false
        }
        return pluginFile.delete()
    }
}
