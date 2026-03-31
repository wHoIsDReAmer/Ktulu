package com.chanwook.dev

import com.chanwook.app.service.FileService
import java.io.File

class MockFileService : FileService {
    private val mockDir =
        File(System.getProperty("java.io.tmpdir"), "ktulu-mock-server").also {
            it.mkdirs()
            File(it, "plugins").mkdirs()
            File(it, "logs").mkdirs()
            File(it, "server.properties").apply {
                if (!exists()) writeText("server-port=25565\ndifficulty=normal\nspawn-protection=16\n")
            }
            File(it, "bukkit.yml").apply {
                if (!exists()) writeText("settings:\n  allow-end: true\n  warn-on-overload: true\n")
            }
            File(it, "eula.txt").apply {
                if (!exists()) writeText("eula=true\n")
            }
        }

    private val service = com.chanwook.app.service.BukkitFileService(mockDir)

    override fun listFiles(path: String) = service.listFiles(path)

    override fun readFile(path: String) = service.readFile(path)

    override fun writeFile(
        path: String,
        content: String,
    ) = service.writeFile(path, content)

    override fun deleteFile(path: String) = service.deleteFile(path)

    override fun getAbsolutePath(path: String) = service.getAbsolutePath(path)

    override fun getDownloadPath(path: String) = service.getDownloadPath(path)

    override fun saveUpload(
        path: String,
        fileName: String,
        bytes: ByteArray,
    ) = service.saveUpload(path, fileName, bytes)
}
