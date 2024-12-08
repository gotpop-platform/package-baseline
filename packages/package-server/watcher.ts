import { BuildConfig, BuildOutput } from "bun"
import { cwd, env } from "process"
import { join, resolve } from "path"

import { WatcherProps } from "./types"
import { contentMap } from "../package-markdown"
import { getRelativePaths } from "./build"
import { logger } from "../package-logger"
import store from "./store"
import { watch } from "fs/promises"

interface BuildResult {
  success: boolean
  buildResponse?: BuildOutput
  error?: unknown
}

async function rebuildFiles({ buildConfig }: { buildConfig: BuildConfig }): Promise<BuildResult> {
  try {
    const buildResponse = await Bun.build(buildConfig)
    store.buildResponse = buildResponse

    if (!buildResponse.success) {
      throw new Error("Build completed but with errors")
    }

    return { success: true, buildResponse }
  } catch (error) {
    logger({
      msg: `Build failed: ${error instanceof Error ? error.message : String(error)}`,
      styles: ["red"],
    })
    return { success: false, error }
  }
}

export async function watcher({ buildConfig, clients, scriptPaths }: WatcherProps) {
  const watchPath = join(env.PROJECT_ROOT || "", "packages/client/src/assets")

  if (!watchPath) {
    throw new Error("PROJECT_ROOT is not defined")
  }

  try {
    const watcher = watch(watchPath, { recursive: true })

    for await (const { eventType, filename } of watcher) {
      if (!filename) continue

      if (filename.match(/\.(css|js|ts|jsx|tsx|html)$/)) {
        logger({ msg: `Content changed: ${filename}`, styles: ["yellow"] })

        const { success, buildResponse, error } = await rebuildFiles({ buildConfig })

        if (success && buildResponse) {
          logger({ msg: "Build successful", styles: ["green"] })
          scriptPaths.length = 0
          scriptPaths.push(...getRelativePaths(buildResponse))

          store.currentContent = await contentMap()
          clients.forEach((client) => client.send("reload"))
        } else {
          // Handle build errors
          if (buildResponse?.logs) {
            buildResponse.logs.forEach((log) => {
              logger({ msg: String(log), styles: ["red"] })
            })
          }
          clients.forEach((client) => client.send("buildError"))
        }
      }
    }
  } catch (watchError) {
    logger({
      msg: `File watcher error: ${
        watchError instanceof Error ? watchError.message : String(watchError)
      }`,
      styles: ["red"],
    })
    throw watchError
  }
}
