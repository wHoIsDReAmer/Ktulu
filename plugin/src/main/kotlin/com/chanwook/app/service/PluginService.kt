package com.chanwook.app.service

interface PluginService {
    fun listPlugins(): List<PluginInfo>
    fun togglePlugin(name: String): PluginInfo?
    fun removePlugin(name: String): Boolean
}
