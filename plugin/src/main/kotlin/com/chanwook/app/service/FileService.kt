package com.chanwook.app.service

import kotlinx.serialization.Serializable

@Serializable
data class FileEntry(
    val name: String,
    val type: String,
    val size: Long,
    val modified: Long,
)

interface FileService {
    fun listFiles(path: String): List<FileEntry>

    fun readFile(path: String): String

    fun writeFile(
        path: String,
        content: String,
    )

    fun deleteFile(path: String): Boolean

    fun getAbsolutePath(path: String): java.io.File?

    fun getDownloadPath(path: String): java.io.File?

    fun saveUpload(
        path: String,
        fileName: String,
        bytes: ByteArray,
    ): Boolean
}
