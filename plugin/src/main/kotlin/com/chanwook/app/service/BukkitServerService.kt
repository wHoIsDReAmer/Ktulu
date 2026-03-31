package com.chanwook.app.service

import org.bukkit.Bukkit
import org.bukkit.GameMode

class BukkitServerService : ServerService {
    private fun <T> sync(action: () -> T): T =
        Bukkit.getScheduler().callSyncMethod(
            Bukkit.getPluginManager().getPlugin("Ktulu")!!,
            action,
        ).get()

    override fun getOnlinePlayers(): List<PlayerInfo> =
        sync {
            Bukkit.getOnlinePlayers().map { player ->
                PlayerInfo(
                    name = player.name,
                    uuid = player.uniqueId.toString(),
                    ping = player.ping,
                    world = player.world.name,
                    health = player.health,
                    level = player.level,
                    gameMode = player.gameMode.name,
                    op = player.isOp,
                    x = player.location.blockX,
                    y = player.location.blockY,
                    z = player.location.blockZ,
                )
            }
        }

    override fun getWorlds(): List<WorldInfo> =
        sync {
            Bukkit.getWorlds().map { world ->
                WorldInfo(
                    name = world.name,
                    environment = world.environment.name,
                    players = world.players.size,
                    entities = world.entityCount,
                    loadedChunks = world.loadedChunks.size,
                )
            }
        }

    override fun kickPlayer(
        name: String,
        reason: String,
    ): Boolean =
        sync {
            val player = Bukkit.getPlayerExact(name) ?: return@sync false
            player.kick(net.kyori.adventure.text.Component.text(reason))
            true
        }

    override fun banPlayer(
        name: String,
        reason: String,
    ): Boolean =
        sync {
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "ban $name $reason")
        }

    override fun unbanPlayer(name: String): Boolean =
        sync {
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "pardon $name")
        }

    override fun setOp(
        name: String,
        op: Boolean,
    ): Boolean =
        sync {
            val player =
                Bukkit.getPlayerExact(name)
                    ?: Bukkit.getOfflinePlayer(name).takeIf { it.hasPlayedBefore() }
                    ?: return@sync false
            player.isOp = op
            true
        }

    override fun setGameMode(
        name: String,
        mode: String,
    ): Boolean =
        sync {
            val player = Bukkit.getPlayerExact(name) ?: return@sync false
            val gameMode =
                try {
                    GameMode.valueOf(mode.uppercase())
                } catch (_: Exception) {
                    return@sync false
                }
            player.gameMode = gameMode
            true
        }

    override fun teleportPlayer(
        name: String,
        target: String,
    ): Boolean =
        sync {
            val player = Bukkit.getPlayerExact(name) ?: return@sync false
            val targetPlayer = Bukkit.getPlayerExact(target) ?: return@sync false
            player.teleport(targetPlayer.location)
        }

    override fun getBannedNames(): List<String> = Bukkit.getBannedPlayers().map { it.name ?: "Unknown" }

    override fun getWhitelist(): List<String> = Bukkit.getWhitelistedPlayers().map { it.name ?: "Unknown" }

    override fun setWhitelistEnabled(enabled: Boolean) {
        Bukkit.setWhitelist(enabled)
    }

    override fun isWhitelistEnabled(): Boolean = Bukkit.hasWhitelist()

    override fun addToWhitelist(name: String): Boolean {
        val player = Bukkit.getOfflinePlayer(name)
        if (player.isWhitelisted) return false
        player.isWhitelisted = true
        return true
    }

    override fun removeFromWhitelist(name: String): Boolean {
        val player = Bukkit.getOfflinePlayer(name)
        if (!player.isWhitelisted) return false
        player.isWhitelisted = false
        return true
    }
}
