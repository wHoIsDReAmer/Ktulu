package com.chanwook.app.service

import kotlinx.serialization.Serializable

@Serializable
data class PlayerInfo(
    val name: String,
    val uuid: String,
    val ping: Int,
    val world: String,
    val health: Double,
    val level: Int,
    val gameMode: String,
    val op: Boolean,
    val x: Int,
    val y: Int,
    val z: Int,
)

@Serializable
data class WorldInfo(
    val name: String,
    val environment: String,
    val players: Int,
    val entities: Int,
    val loadedChunks: Int,
)

interface ServerService {
    fun getOnlinePlayers(): List<PlayerInfo>

    fun getWorlds(): List<WorldInfo>

    fun kickPlayer(
        name: String,
        reason: String,
    ): Boolean

    fun banPlayer(
        name: String,
        reason: String,
    ): Boolean

    fun unbanPlayer(name: String): Boolean

    fun setOp(
        name: String,
        op: Boolean,
    ): Boolean

    fun setGameMode(
        name: String,
        mode: String,
    ): Boolean

    fun teleportPlayer(
        name: String,
        target: String,
    ): Boolean

    fun getBannedNames(): List<String>

    fun getWhitelist(): List<String>

    fun setWhitelistEnabled(enabled: Boolean)

    fun isWhitelistEnabled(): Boolean

    fun addToWhitelist(name: String): Boolean

    fun removeFromWhitelist(name: String): Boolean
}
