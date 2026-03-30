package com.chanwook.app.service

import kotlinx.serialization.Serializable

@Serializable
data class PluginInfo(
    val name: String,
    val version: String,
    val enabled: Boolean,
    val description: String,
    val authors: List<String>
)
