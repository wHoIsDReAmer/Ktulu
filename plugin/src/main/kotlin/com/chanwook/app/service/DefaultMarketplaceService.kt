package com.chanwook.app.service

import com.chanwook.app.common.Logger
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.File

class DefaultMarketplaceService(
    private val pluginsDir: File = File("plugins"),
) : MarketplaceService {
    private val json =
        Json {
            ignoreUnknownKeys = true
            prettyPrint = true
        }

    private val client =
        HttpClient(CIO) {
            install(ContentNegotiation) {
                json(json)
            }
            followRedirects = true
        }

    override suspend fun search(
        query: String,
        source: String?,
    ): List<MarketplacePlugin> {
        if (query.isBlank()) return emptyList()

        val results = mutableListOf<MarketplacePlugin>()

        if (source == null || source == "modrinth") {
            try {
                results.addAll(searchModrinth(query))
            } catch (e: Exception) {
                Logger.error("Modrinth search failed", e)
            }
        }

        if (source == null || source == "hangar") {
            try {
                results.addAll(searchHangar(query))
            } catch (e: Exception) {
                Logger.error("Hangar search failed", e)
            }
        }

        return results
    }

    override suspend fun install(
        source: String,
        id: String,
    ): Boolean {
        return try {
            when (source) {
                "modrinth" -> installFromModrinth(id)
                "hangar" -> installFromHangar(id)
                else -> false
            }
        } catch (e: Exception) {
            Logger.error("Failed to install plugin from $source: $id", e)
            false
        }
    }

    private suspend fun searchModrinth(query: String): List<MarketplacePlugin> {
        val response: ModrinthSearchResponse =
            client.get("https://api.modrinth.com/v2/search") {
                parameter("query", query)
                parameter("facets", """[["project_type:plugin"],["server_side:required","server_side:optional"]]""")
                parameter("limit", 20)
            }.body()

        return response.hits.map { hit ->
            MarketplacePlugin(
                id = hit.projectId,
                name = hit.title,
                description = hit.description,
                author = hit.author,
                downloads = hit.downloads,
                iconUrl = hit.iconUrl.orEmpty(),
                source = "modrinth",
                slug = hit.slug,
                version = hit.latestVersion.orEmpty(),
                gameVersions = hit.gameVersions,
            )
        }
    }

    private suspend fun searchHangar(query: String): List<MarketplacePlugin> {
        val response: HangarSearchResponse =
            client.get("https://hangar.papermc.io/api/v1/projects") {
                parameter("q", query)
                parameter("platform", "PAPER")
                parameter("limit", 20)
            }.body()

        return response.result.map { project ->
            MarketplacePlugin(
                id = project.namespace.let { "${it.owner}/${it.slug}" },
                name = project.name,
                description = project.description,
                author = project.namespace.owner,
                downloads = project.stats.downloads.toLong(),
                iconUrl = project.avatarUrl.orEmpty(),
                source = "hangar",
                slug = project.namespace.slug,
                version = project.lastUpdated.orEmpty(),
                gameVersions = emptyList(),
            )
        }
    }

    private suspend fun installFromModrinth(projectId: String): Boolean {
        val versions: List<ModrinthVersion> =
            client.get("https://api.modrinth.com/v2/project/$projectId/version") {
                parameter("loaders", """["paper","bukkit","spigot"]""")
                parameter("limit", 1)
            }.body()

        val version = versions.firstOrNull() ?: return false
        val file = version.files.firstOrNull { it.primary } ?: version.files.firstOrNull() ?: return false

        return downloadFile(file.url, file.filename)
    }

    private suspend fun installFromHangar(id: String): Boolean {
        // id format: "owner/slug"
        val parts = id.split("/")
        if (parts.size != 2) return false
        val (owner, slug) = parts

        val response: HangarVersionsResponse =
            client.get(
                "https://hangar.papermc.io/api/v1/projects/$slug/versions",
            ) {
                parameter("limit", 1)
                parameter("platform", "PAPER")
            }.body()

        val version = response.result.firstOrNull() ?: return false
        val downloadUrl = "https://hangar.papermc.io/api/v1/projects/$slug/versions/${version.name}/PAPER/download"
        val filename = "$slug-${version.name}.jar"

        return downloadFile(downloadUrl, filename)
    }

    private val downloadClient =
        HttpClient(CIO) {
            followRedirects = true
        }

    private suspend fun downloadFile(
        url: String,
        filename: String,
    ): Boolean {
        pluginsDir.mkdirs()
        val targetFile = File(pluginsDir, filename)

        val response: HttpResponse = downloadClient.get(url)
        val bytes: ByteArray = response.body()
        targetFile.writeBytes(bytes)

        Logger.info("Downloaded plugin: $filename (${bytes.size / 1024}KB)")
        return true
    }

    // --- Modrinth API models ---

    @Serializable
    private data class ModrinthSearchResponse(val hits: List<ModrinthHit>)

    @Serializable
    private data class ModrinthHit(
        @SerialName("project_id") val projectId: String,
        val title: String,
        val description: String,
        val author: String,
        val downloads: Long,
        @SerialName("icon_url") val iconUrl: String? = null,
        val slug: String,
        @SerialName("latest_version") val latestVersion: String? = null,
        @SerialName("game_versions") val gameVersions: List<String> = emptyList(),
    )

    @Serializable
    private data class ModrinthVersion(
        val files: List<ModrinthFile>,
    )

    @Serializable
    private data class ModrinthFile(
        val url: String,
        val filename: String,
        val primary: Boolean = false,
    )

    // --- Hangar API models ---

    @Serializable
    private data class HangarSearchResponse(val result: List<HangarProject>)

    @Serializable
    private data class HangarProject(
        val name: String,
        val description: String,
        val namespace: HangarNamespace,
        val stats: HangarStats,
        val avatarUrl: String? = null,
        val lastUpdated: String? = null,
    )

    @Serializable
    private data class HangarNamespace(val owner: String, val slug: String)

    @Serializable
    private data class HangarStats(val downloads: Int)

    @Serializable
    private data class HangarVersionsResponse(val result: List<HangarVersion>)

    @Serializable
    private data class HangarVersion(val name: String)
}
