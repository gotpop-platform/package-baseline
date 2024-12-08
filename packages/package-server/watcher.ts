import { BuildConfig, BuildOutput } from "bun"
import { dirname, join } from "path"

import { WatcherProps } from "./types"
import { contentMap } from "../package-markdown"
import { env } from "process"
import { getRelativePaths } from "./build"
import { logger } from "@/gotpop-platform/package-logger"
import { store } from "./store"
import { watch } from "fs/promises"

interface BuildResult {
  success: boolean
  buildResponse?: BuildOutput
  error?: unknown
}

async function rebuildFiles({ buildConfig }: { buildConfig: BuildConfig }): Promise<BuildResult> {
  if (!buildConfig) {
    return {
      success: false,
      error: new Error("Build config is required"),
    }
  }

  try {
    const buildResponse = await Bun.build(buildConfig)
    store.buildResponse = buildResponse

    if (!buildResponse.success) {
      const errorMessage = buildResponse.logs
        ? buildResponse.logs.join("\n")
        : "Build completed but with errors"
      throw new Error(errorMessage)
    }

    return { success: true, buildResponse }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown build error occurred"

    logger({
      msg: `Build failed: ${errorMessage}`,
      styles: ["red"],
    })
    return { success: false, error }
  }
}

async function createWatcher(watchPath: string, handleChange: (filename: string) => void) {
  if (!watchPath) {
    throw new Error("Watch path is required")
  }

  try {
    const watcher = watch(watchPath, { recursive: true })

    for await (const event of watcher) {
      if (!event || !event.filename) {
        logger({ msg: "Received invalid file event", styles: ["yellow"] })
        continue
      }

      const VALID_FILE_PATTERN = /\.(css|js|md|ts|jsx|tsx|html)$/

      if (event.filename.match(VALID_FILE_PATTERN)) {
        logger({ msg: `Content changed: ${event.filename}`, styles: ["yellow"] })
        try {
          await handleChange(event.filename)
        } catch (error) {
          logger({
            msg: `Error handling file change: ${
              error instanceof Error ? error.message : String(error)
            }`,
            styles: ["red"],
          })
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown watcher error occurred"

    logger({
      msg: `File watcher error for ${watchPath}: ${errorMessage}`,
      styles: ["red"],
    })
    throw error
  }
}

export async function watcher({
  buildConfig,
  clients,
  scriptPaths,
  watchPaths = [],
}: WatcherProps) {
  if (!buildConfig || !clients || !scriptPaths) {
    throw new Error("Missing required watcher properties")
  }

  const upTwoLevels = join(dirname(process.cwd()), "..", "..")

  const ROOT = env.PROJECT_ROOT || upTwoLevels
  const resolvedPaths = watchPaths.map((path) => join(ROOT, path))

  if (resolvedPaths.length === 0) {
    logger({ msg: "No paths to watch", styles: ["yellow"] })

    return
  }

  const handleChange = async () => {
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

  await Promise.all(resolvedPaths.map((path) => createWatcher(path, handleChange)))
}
