package com.chanwook.app.service

interface MarketplaceService {
    suspend fun search(
        query: String,
        source: String? = null,
    ): List<MarketplacePlugin>

    suspend fun install(
        source: String,
        id: String,
    ): Boolean
}
