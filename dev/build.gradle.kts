plugins {
    id("buildlogic.kotlin-application-conventions")
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    implementation(project(":plugin"))
}

application {
    mainClass = "com.chanwook.dev.MainKt"
}
