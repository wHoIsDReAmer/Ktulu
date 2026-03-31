package com.chanwook.dev

import com.chanwook.app.common.Logger
import com.chanwook.app.server.KtorServer
import com.chanwook.app.service.DefaultMarketplaceService

fun main() {
    Logger.init { println(it) }

    val server = KtorServer(MockPluginService(), DefaultMarketplaceService())
    Logger.info("개발 서버를 시작합니다. (http://localhost:8332)")
    server.startServer()

    Runtime.getRuntime().addShutdownHook(Thread {
        Logger.info("개발 서버를 종료합니다.")
        server.stopServer()
    })

    Thread.currentThread().join()
}
