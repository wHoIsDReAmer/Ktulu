package com.chanwook.app.service

import com.chanwook.app.common.Logger
import org.bukkit.Bukkit
import org.bukkit.plugin.Plugin
import org.bukkit.plugin.PluginDescriptionFile
import org.bukkit.plugin.java.JavaPlugin
import java.io.File
import java.net.URLClassLoader
import java.util.jar.JarFile
import java.util.concurrent.Callable

class BukkitPluginService(private val plugin: JavaPlugin) : PluginService {

    private fun <T> runOnMainThread(task: () -> T): T {
        if (Bukkit.isPrimaryThread()) return task()
        return Bukkit.getScheduler()
            .callSyncMethod(plugin, Callable { task() })
            .get()
    }

    override fun listPlugins(): List<PluginInfo> {
        val loadedPlugins = runOnMainThread {
            Bukkit.getPluginManager().plugins.map { p ->
                PluginInfo(
                    name = p.name,
                    version = p.pluginMeta.version,
                    enabled = p.isEnabled,
                    loaded = true,
                    description = p.pluginMeta.description ?: "",
                    authors = p.pluginMeta.authors,
                )
            }
        }

        val loadedNames = loadedPlugins.map { it.name.lowercase() }.toSet()

        val unloadedPlugins = try {
            File("plugins").listFiles()
                ?.filter { it.extension == "jar" }
                ?.filter { file ->
                    // Skip JARs whose filename matches a loaded plugin to avoid corrupting classloaders
                    loadedNames.none { name -> file.nameWithoutExtension.contains(name, ignoreCase = true) }
                }
                ?.mapNotNull { file -> readPluginYml(file) }
                ?: emptyList()
        } catch (e: Exception) {
            Logger.error("Failed to scan unloaded plugins", e)
            emptyList()
        }

        return loadedPlugins + unloadedPlugins
    }

    private fun readPluginYml(file: File): PluginInfo? {
        return try {
            JarFile(file).use { jar ->
                val entry = jar.getJarEntry("plugin.yml") ?: return null
                val desc = jar.getInputStream(entry).use { PluginDescriptionFile(it) }
                PluginInfo(
                    name = desc.name,
                    version = desc.version,
                    enabled = false,
                    loaded = false,
                    description = desc.description ?: "",
                    authors = desc.authors,
                    fileName = file.name,
                )
            }
        } catch (_: Exception) {
            null
        }
    }

    override fun togglePlugin(name: String): PluginInfo? {
        return runOnMainThread {
            val p = Bukkit.getPluginManager().getPlugin(name) ?: return@runOnMainThread null

            if (p.isEnabled) {
                Bukkit.getPluginManager().disablePlugin(p)
            } else {
                Bukkit.getPluginManager().enablePlugin(p)
            }

            PluginInfo(
                name = p.name,
                version = p.pluginMeta.version,
                enabled = p.isEnabled,
                loaded = true,
                description = p.pluginMeta.description ?: "",
                authors = p.pluginMeta.authors,
            )
        }
    }

    override fun loadPlugin(fileName: String): PluginInfo? {
        val file = File("plugins", fileName)
        if (!file.exists()) return null

        return runOnMainThread {
            val pm = Bukkit.getPluginManager()
            val loaded = pm.loadPlugin(file) ?: return@runOnMainThread null
            pm.enablePlugin(loaded)

            PluginInfo(
                name = loaded.name,
                version = loaded.pluginMeta.version,
                enabled = loaded.isEnabled,
                loaded = true,
                description = loaded.pluginMeta.description ?: "",
                authors = loaded.pluginMeta.authors,
            )
        }
    }

    override fun unloadPlugin(name: String): Boolean {
        return runOnMainThread {
            val pm = Bukkit.getPluginManager()
            val target = pm.getPlugin(name) ?: return@runOnMainThread false

            // 1. Disable
            if (target.isEnabled) {
                pm.disablePlugin(target)
            }

            try {
                // 2. Remove from plugin manager internals via reflection
                removeFromManager(pm, target, name)

                // 3. Close classloader
                val classLoader = target.javaClass.classLoader
                if (classLoader is AutoCloseable) {
                    classLoader.close()
                }

                Logger.info("Unloaded plugin: $name")
                true
            } catch (e: Exception) {
                Logger.error("Failed to unload plugin via reflection: $name", e)
                false
            }
        }
    }

    private fun removeFromManager(pm: Any, target: Plugin, name: String) {
        // Walk up the class hierarchy and find List/Map fields that contain the plugin
        fun scanAndRemove(obj: Any) {
            var cls: Class<*>? = obj.javaClass
            while (cls != null && cls != Any::class.java) {
                for (field in cls.declaredFields) {
                    try {
                        field.isAccessible = true
                        val value = field.get(obj)
                        if (value is MutableList<*> && value.contains(target)) {
                            value.remove(target)
                            Logger.info("Removed plugin from ${cls.simpleName}.${field.name}")
                        }
                        if (value is MutableMap<*, *> && value.containsKey(name.lowercase())) {
                            value.remove(name.lowercase())
                            Logger.info("Removed lookup from ${cls.simpleName}.${field.name}")
                        }
                    } catch (_: Exception) {}
                }
                cls = cls.superclass
            }
        }

        // Scan the plugin manager itself
        scanAndRemove(pm)

        // Scan nested manager objects recursively (Paper wraps managers)
        fun scanNested(obj: Any, depth: Int, visited: MutableSet<Int>) {
            if (depth > 4 || !visited.add(System.identityHashCode(obj))) return
            var cls: Class<*>? = obj.javaClass
            while (cls != null && cls != Any::class.java) {
                for (field in cls.declaredFields) {
                    try {
                        field.isAccessible = true
                        val nested = field.get(obj) ?: continue
                        val className = nested.javaClass.name
                        if (className.contains("Plugin", ignoreCase = true) &&
                            !className.startsWith("java.") &&
                            !className.startsWith("kotlin.")) {
                            scanAndRemove(nested)
                            scanNested(nested, depth + 1, visited)
                        }
                    } catch (_: Exception) {}
                }
                cls = cls.superclass
            }
        }

        scanNested(pm, 0, mutableSetOf())
    }

    override fun removePlugin(name: String): Boolean {
        runOnMainThread {
            val p = Bukkit.getPluginManager().getPlugin(name)
            if (p != null && p.isEnabled) {
                Bukkit.getPluginManager().disablePlugin(p)
            }
        }

        val pluginsDir = File("plugins")
        val targetFile = File(pluginsDir, name).takeIf { it.exists() && it.extension == "jar" }
            ?: File(pluginsDir, "$name.jar").takeIf { it.exists() }
            ?: pluginsDir.listFiles()?.firstOrNull {
                it.name.endsWith(".jar") && it.name.contains(name, ignoreCase = true)
            }

        return targetFile?.delete() ?: false
    }
}
