plugins {
    id("buildlogic.kotlin-application-conventions")
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.shadow)
}

repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    implementation(libs.commons.text)
    compileOnly("io.papermc.paper:paper-api:1.21.11-R0.1-SNAPSHOT")

    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)

    testImplementation("org.junit.jupiter:junit-jupiter:${libs.versions.junit.jupiter.get()}")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.chanwook.app.Ktulu"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}

tasks.shadowJar {
    archiveClassifier.set("")
    archiveBaseName.set("Ktulu")

    dependencies {
        exclude(dependency("io.papermc.paper:.*"))
    }

    mergeServiceFiles()
}
