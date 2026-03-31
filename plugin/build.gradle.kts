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
    compileOnly("org.apache.logging.log4j:log4j-core:2.24.1")

    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.content.negotiation)

    testImplementation("org.junit.jupiter:junit-jupiter:${libs.versions.junit.jupiter.get()}")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.chanwook.app.Ktulu"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}

val buildWeb by tasks.registering(Exec::class) {
    description = "Build web frontend with pnpm"
    workingDir = file("${rootProject.projectDir}/web")
    commandLine("pnpm", "build")
    inputs.dir("${rootProject.projectDir}/web/src")
    inputs.file("${rootProject.projectDir}/web/package.json")
    inputs.file("${rootProject.projectDir}/web/index.html")
    outputs.dir("${rootProject.projectDir}/web/dist")
}

val copyWebDist by tasks.registering(Copy::class) {
    description = "Copy web dist into plugin resources"
    dependsOn(buildWeb)
    from("${rootProject.projectDir}/web/dist")
    into(layout.buildDirectory.dir("resources/main/web"))
}

tasks.processResources {
    dependsOn(copyWebDist)
}

tasks.shadowJar {
    archiveClassifier.set("")
    archiveBaseName.set("Ktulu")

    dependencies {
        exclude(dependency("io.papermc.paper:.*"))
    }

    mergeServiceFiles()

    // Paper PluginRemapper fails on duplicate META-INF entries from Netty
    exclude("META-INF/LICENSE.txt")
    exclude("META-INF/NOTICE.txt")
    exclude("META-INF/io.netty.versions.properties")
}
