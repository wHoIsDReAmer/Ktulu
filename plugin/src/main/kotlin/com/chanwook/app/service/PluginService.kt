package com.chanwook.app.service

interface PluginService {
    fun listPlugins(): List<PluginInfo>

    fun togglePlugin(name: String): PluginInfo?

    fun loadPlugin(fileName: String): PluginInfo?

    fun unloadPlugin(name: String): Boolean

    fun removePlugin(name: String): Boolean
}
