package com.chanwook.app.service

import kotlinx.serialization.Serializable

@Serializable
data class MarketplacePlugin(
    val id: String,
    val name: String,
    val description: String,
    val author: String,
    val downloads: Long,
    val iconUrl: String = "",
    val source: String,
    val slug: String,
    val version: String = "",
    val gameVersions: List<String> = emptyList(),
)
