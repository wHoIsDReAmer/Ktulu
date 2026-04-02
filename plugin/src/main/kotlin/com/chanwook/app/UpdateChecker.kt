package com.chanwook.app

import com.chanwook.app.common.Logger
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class UpdateChecker(private val currentVersion: String) {
    companion object {
        private const val GITHUB_API = "https://api.github.com/repos/wHoIsDReAmer/Ktulu/releases/latest"
    }

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun check() {
        try {
            val client = HttpClient(CIO)
            val response = withContext(Dispatchers.IO) {
                client.get(GITHUB_API) {
                    header("Accept", "application/vnd.github+json")
                }
            }
            client.close()

            val body = response.bodyAsText()
            val release = json.parseToJsonElement(body).jsonObject
            val latestTag = release["tag_name"]?.jsonPrimitive?.content ?: return
            val latestVersion = latestTag.removePrefix("v")

            if (isNewer(latestVersion, currentVersion)) {
                val downloadUrl = release["assets"]?.jsonArray
                    ?.firstOrNull()?.jsonObject
                    ?.get("browser_download_url")?.jsonPrimitive?.content

                Logger.info("§e[Update] 새로운 버전이 있습니다: §fv$latestVersion §7(현재: v$currentVersion)")
                if (downloadUrl != null) {
                    Logger.info("§e[Update] 다운로드: §f$downloadUrl")
                }
            }
        } catch (e: Exception) {
            Logger.warning("업데이트 확인 실패: ${e.message}")
        }
    }

    private fun isNewer(latest: String, current: String): Boolean {
        val l = latest.split(".").mapNotNull { it.toIntOrNull() }
        val c = current.split(".").mapNotNull { it.toIntOrNull() }
        for (i in 0 until maxOf(l.size, c.size)) {
            val lv = l.getOrElse(i) { 0 }
            val cv = c.getOrElse(i) { 0 }
            if (lv > cv) return true
            if (lv < cv) return false
        }
        return false
    }
}
