package com.chanwook.app.server.marketplace

import com.chanwook.app.common.Logger
import com.chanwook.app.service.MarketplaceService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

fun Route.marketplaceRoutes(marketplaceService: MarketplaceService) {

    get("/marketplace/search") {
        val query = call.parameters["query"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, "query parameter required")
        val source = call.parameters["source"]

        try {
            val results = marketplaceService.search(query, source)
            call.respond(HttpStatusCode.OK, results)
        } catch (e: Exception) {
            Logger.error("Marketplace search failed", e)
            call.respond(HttpStatusCode.InternalServerError, "Search failed")
        }
    }

    post("/marketplace/install") {
        @Serializable
        data class InstallRequest(val source: String, val id: String)

        try {
            val req = call.receive<InstallRequest>()
            val success = marketplaceService.install(req.source, req.id)
            if (success) {
                call.respond(HttpStatusCode.OK, mapOf("message" to "Plugin installed. Restart server to load."))
            } else {
                call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Failed to install plugin"))
            }
        } catch (e: Exception) {
            Logger.error("Marketplace install failed", e)
            call.respond(HttpStatusCode.InternalServerError, "Install failed")
        }
    }
}
