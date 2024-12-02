package com.chanwook.app

import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.assertEquals

class MessageUtilsTest {
    @Test fun testGetMessage() {
        val msgUtils = MessageUtils()

        assertEquals("Hello World!", msgUtils.getMessage())
    }
}
