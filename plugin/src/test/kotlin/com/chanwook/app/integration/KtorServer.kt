package com.chanwook.app.integration

import com.chanwook.app.server.KtorServer
import org.junit.jupiter.api.Test

class KtorServer {
    @Test
    fun testKtorServer() {
        val ktorServer = KtorServer()
        ktorServer.startServer()

        // 10초간 대기
        Thread.sleep(10000)

        ktorServer.stopServer()
    }
}