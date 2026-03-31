package com.chanwook.app.server.file

import com.chanwook.app.common.Logger
import com.chanwook.app.service.FileService
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class FileContentRequest(val content: String)

fun Route.fileRoutes(fileService: FileService) {
    get("/files") {
        val path = call.request.queryParameters["path"] ?: "/"
        try {
            val files = fileService.listFiles(path)
            call.respond(HttpStatusCode.OK, files)
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Forbidden, mapOf("error" to (e.message ?: "Access denied")))
        } catch (e: Exception) {
            Logger.error("Error listing files", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error listing files"))
        }
    }

    get("/files/content") {
        val path =
            call.request.queryParameters["path"]
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Path required"))
        try {
            val content = fileService.readFile(path)
            call.respond(HttpStatusCode.OK, mapOf("content" to content))
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Forbidden, mapOf("error" to (e.message ?: "Access denied")))
        } catch (e: Exception) {
            Logger.error("Error reading file", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error reading file"))
        }
    }

    put("/files/content") {
        val path =
            call.request.queryParameters["path"]
                ?: return@put call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Path required"))
        try {
            val body = call.receive<FileContentRequest>()
            fileService.writeFile(path, body.content)
            call.respond(HttpStatusCode.OK, mapOf("message" to "File saved"))
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Forbidden, mapOf("error" to (e.message ?: "Access denied")))
        } catch (e: Exception) {
            Logger.error("Error writing file", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error writing file"))
        }
    }

    get("/files/download") {
        val path =
            call.request.queryParameters["path"]
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Path required"))
        try {
            val file =
                fileService.getAbsolutePath(path)
                    ?: return@get call.respond(HttpStatusCode.NotFound, mapOf("error" to "File not found"))
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName,
                    file.name,
                ).toString(),
            )
            call.respondFile(file)
        } catch (e: Exception) {
            Logger.error("Error downloading file", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error downloading file"))
        }
    }

    post("/files/upload") {
        val path = call.request.queryParameters["path"] ?: "/"
        try {
            val multipart = call.receiveMultipart()
            var uploaded = false
            multipart.forEachPart { part ->
                if (part is PartData.FileItem) {
                    val fileName = part.originalFileName ?: "unknown"
                    val bytes = part.streamProvider().readBytes()
                    fileService.saveUpload(path, fileName, bytes)
                    uploaded = true
                }
                part.dispose()
            }
            if (uploaded) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "File uploaded"))
            } else {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "No file provided"))
            }
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Forbidden, mapOf("error" to (e.message ?: "Access denied")))
        } catch (e: Exception) {
            Logger.error("Error uploading file", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error uploading file"))
        }
    }

    delete("/files") {
        val path =
            call.request.queryParameters["path"]
                ?: return@delete call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Path required"))
        try {
            val deleted = fileService.deleteFile(path)
            if (deleted) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Deleted"))
            } else {
                call.respond(HttpStatusCode.NotFound, mapOf("error" to "Not found"))
            }
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.Forbidden, mapOf("error" to (e.message ?: "Access denied")))
        } catch (e: Exception) {
            Logger.error("Error deleting file", e)
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Error deleting file"))
        }
    }
}
