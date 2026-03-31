package com.chanwook.app.server.plugin

import com.chanwook.app.common.Logger
import com.chanwook.app.service.PluginService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.pluginRoutes(pluginService: PluginService) {

    get("/plugins") {
        try {
            val plugins = pluginService.listPlugins()
            call.respond(HttpStatusCode.OK, plugins)
        } catch (e: Exception) {
            Logger.error("Error listing plugins", e)
            call.respond(HttpStatusCode.InternalServerError, "Error listing plugins")
        }
    }

    post("/plugins/{name}/toggle") {
        val name = call.parameters["name"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, "Plugin name required")

        try {
            val result = pluginService.togglePlugin(name)
            if (result != null) {
                call.respond(HttpStatusCode.OK, result)
            } else {
                call.respond(HttpStatusCode.NotFound, "Plugin not found: $name")
            }
        } catch (e: Exception) {
            Logger.error("Error toggling plugin: $name", e)
            call.respond(HttpStatusCode.InternalServerError, "Error toggling plugin")
        }
    }

    post("/plugins/{name}/unload") {
        val name = call.parameters["name"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, "Plugin name required")

        try {
            val result = pluginService.unloadPlugin(name)
            if (result) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Plugin unloaded: $name"))
            } else {
                call.respond(HttpStatusCode.NotFound, "Plugin not found: $name")
            }
        } catch (e: Exception) {
            Logger.error("Error unloading plugin: $name", e)
            call.respond(HttpStatusCode.InternalServerError, "Error unloading plugin")
        }
    }

    post("/plugins/{fileName}/load") {
        val fileName = call.parameters["fileName"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, "File name required")

        try {
            val result = pluginService.loadPlugin(fileName)
            if (result != null) {
                call.respond(HttpStatusCode.OK, result)
            } else {
                call.respond(HttpStatusCode.NotFound, "Plugin file not found: $fileName")
            }
        } catch (e: Exception) {
            Logger.error("Error loading plugin: $fileName", e)
            call.respond(HttpStatusCode.InternalServerError, "Error loading plugin")
        }
    }

    delete("/plugins/{name}") {
        val name = call.parameters["name"]
            ?: return@delete call.respond(HttpStatusCode.BadRequest, "Plugin name required")

        try {
            val removed = pluginService.removePlugin(name)
            if (removed) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Plugin removed: $name"))
            } else {
                call.respond(HttpStatusCode.NotFound, "Plugin not found: $name")
            }
        } catch (e: Exception) {
            Logger.error("Error removing plugin: $name", e)
            call.respond(HttpStatusCode.InternalServerError, "Error removing plugin")
        }
    }
}
