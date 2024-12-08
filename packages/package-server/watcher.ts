import { BuildConfig, BuildOutput } from "bun"
import { cwd, env } from "process"
import { join, resolve } from "path"

import { WatcherProps } from "./types"
import { contentMap } from "../package-markdown"
import { getRelativePaths } from "./build"
import { logger } from "../package-logger"
import { store } from "./store"
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

async function createWatcher(watchPath: string, handleChange: (filename: string) => void) {
  try {
    const watcher = watch(watchPath, { recursive: true })

    for await (const { eventType, filename } of watcher) {
      if (!filename) continue

      if (filename.match(/\.(css|js|md|ts|jsx|tsx|html)$/)) {
        logger({ msg: `Content changed: ${filename}`, styles: ["yellow"] })
        handleChange(filename)
      }
    }
  } catch (error) {
    logger({
      msg: `File watcher error for ${watchPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      styles: ["red"],
    })
    throw error
  }
}

export async function watcher({
  buildConfig,
  clients,
  scriptPaths,
  watchPaths = ["packages/client/src"],
}: WatcherProps) {
  const resolvedPaths = watchPaths.map((path) => join(env.PROJECT_ROOT || "", path))

  if (!env.PROJECT_ROOT) {
    throw new Error("PROJECT_ROOT is not defined")
  }

  const handleChange = async (filename: string) => {
    const { success, buildResponse, error } = await rebuildFiles({ buildConfig })

    if (success && buildResponse) {
      logger({ msg: "Build successful", styles: ["green"] })
      scriptPaths.length = 0
      scriptPaths.push(...getRelativePaths(buildResponse))

      store.currentContent = await contentMap()
      clients.forEach((client) => client.send("reload"))
    } else {
      if (buildResponse?.logs) {
        buildResponse.logs.forEach((log) => {
          logger({ msg: String(log), styles: ["red"] })
        })
      }
      clients.forEach((client) => client.send("buildError"))
    }
  }

  // Create watchers for all paths concurrently
  await Promise.all(resolvedPaths.map((path) => createWatcher(path, handleChange)))
}
