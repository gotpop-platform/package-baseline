import { BuildConfig } from "bun"
import { WatcherProps } from "./types"
import { contentMap } from "../package-markdown"
import { getRelativePaths } from "./build"
import { logger } from "@gotpop-platform/package-logger"
import store from "./store"
import { watch } from "fs/promises"

async function rebuildFiles({ buildConfig }: { buildConfig: BuildConfig }) {
  try {
    store.buildResponse = await Bun.build(buildConfig)

    return { success: true, buildResponse: store.buildResponse }
  } catch (error) {
    logger({ msg: `Build failed: ${error}`, styles: ["red"] })
    return { success: false, error }
  }
}

export async function watcher({ buildConfig, clients, scriptPaths }: WatcherProps) {
  const watcher = watch(".", { recursive: true })

  for await (const { filename } of watcher) {
    if (filename?.includes("src")) {
      logger({ msg: `Content changed: ${filename}`, styles: ["yellow"] })

      if (filename.match(/\.(css|js|ts)$/)) {
        const { success, buildResponse } = await rebuildFiles({ buildConfig })

        if (success) {
          logger({ msg: "Build successful", styles: ["green"] })
          scriptPaths.length = 0

          if (buildResponse) {
            scriptPaths.push(...getRelativePaths(buildResponse))
          }
        }
      }

      store.currentContent = await contentMap()

      for (const client of clients) {
        client.send("reload")
      }
    }
  }
}
