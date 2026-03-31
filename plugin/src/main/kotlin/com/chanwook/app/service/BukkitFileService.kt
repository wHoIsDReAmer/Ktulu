package com.chanwook.app.service

import java.io.File

class BukkitFileService(private val serverDir: File) : FileService {
    private val allowedRoots =
        listOf(
            "plugins", "config", "server.properties",
            "bukkit.yml", "spigot.yml", "paper-global.yml",
            "paper-world-defaults.yml", "permissions.yml",
            "commands.yml", "eula.txt", "whitelist.json",
            "banned-ips.json", "banned-players.json", "ops.json",
            "logs", "world", "world_nether", "world_the_end",
        )

    private fun resolve(path: String): File? {
        val normalized = path.removePrefix("/").trimEnd('/')
        if (normalized.isEmpty()) return serverDir

        val top = normalized.split("/").first()
        if (allowedRoots.none { top.equals(it, ignoreCase = true) }) return null

        val file = File(serverDir, normalized).canonicalFile
        if (!file.path.startsWith(serverDir.canonicalPath)) return null

        return file
    }

    override fun listFiles(path: String): List<FileEntry> {
        if (path.isEmpty() || path == "/") {
            return serverDir.listFiles()
                ?.filter { it.name in allowedRoots }
                ?.sortedWith(compareByDescending<File> { it.isDirectory }.thenBy { it.name })
                ?.map { it.toEntry() }
                ?: emptyList()
        }

        val dir = resolve(path) ?: throw IllegalArgumentException("Access denied: $path")
        if (!dir.isDirectory) throw IllegalArgumentException("Not a directory: $path")

        return dir.listFiles()
            ?.sortedWith(compareByDescending<File> { it.isDirectory }.thenBy { it.name })
            ?.map { it.toEntry() }
            ?: emptyList()
    }

    override fun readFile(path: String): String {
        val file = resolve(path) ?: throw IllegalArgumentException("Access denied: $path")
        if (!file.isFile) throw IllegalArgumentException("Not a file: $path")
        return file.readText()
    }

    override fun writeFile(
        path: String,
        content: String,
    ) {
        val file = resolve(path) ?: throw IllegalArgumentException("Access denied: $path")
        if (!file.isFile) throw IllegalArgumentException("Not a file: $path")
        file.writeText(content)
    }

    override fun deleteFile(path: String): Boolean {
        val file = resolve(path) ?: throw IllegalArgumentException("Access denied: $path")
        if (!file.exists()) return false
        return if (file.isDirectory) file.deleteRecursively() else file.delete()
    }

    override fun getAbsolutePath(path: String): File? {
        val file = resolve(path) ?: return null
        return if (file.isFile) file else null
    }

    override fun saveUpload(
        path: String,
        fileName: String,
        bytes: ByteArray,
    ): Boolean {
        val dir =
            if (path.isEmpty() || path == "/") {
                serverDir
            } else {
                resolve(path)
                    ?: throw IllegalArgumentException("Access denied: $path")
            }
        if (!dir.isDirectory) throw IllegalArgumentException("Not a directory: $path")

        val top =
            if (path.isEmpty() || path == "/") {
                fileName.split("/").first()
            } else {
                path.removePrefix("/").split("/").first()
            }
        if (allowedRoots.none { top.equals(it, ignoreCase = true) }) {
            throw IllegalArgumentException("Access denied: $path/$fileName")
        }

        val target = File(dir, fileName)
        if (!target.canonicalPath.startsWith(serverDir.canonicalPath)) {
            throw IllegalArgumentException("Access denied")
        }
        target.parentFile?.mkdirs()
        target.writeBytes(bytes)
        return true
    }

    private fun File.toEntry() =
        FileEntry(
            name = name,
            type = if (isDirectory) "directory" else "file",
            size = if (isFile) length() else 0L,
            modified = lastModified(),
        )
}
