import { BuildConfig, BuildOutput } from "bun"
import { dirname, join, resolve, normalize } from "path"

import { type WatcherProps, getRelativePaths, store } from "."
import { contentMap } from "../package-markdown"
import { env } from "process"
import { logger } from "../package-logger"
import { watch as fsWatch } from "fs"

function resolveCompletePath(basePath: string, filename?: string): string {
  if (!filename) return resolve(basePath)

  return join(resolve(basePath), filename)
}

function isPathExcluded(path: string, watchPathsExcluded: string[]): boolean {
  const absolutePath = resolve(path)
  const normalizedPath = normalize(absolutePath).toLowerCase()

  return watchPathsExcluded.some((excluded) => normalizedPath.includes(`/${excluded}/`))
}

interface WatchParams {
  handleChange: Function
  resolvedPaths: string[]
  serverConfig: { watchPathsExcluded?: string[] }
}

function watchWithExclusions({
  handleChange,
  resolvedPaths,
  serverConfig: { watchPathsExcluded = [] },
}: WatchParams) {
  resolvedPaths.forEach((basePath) => {
    const absolutePath = resolve(basePath)

    if (!isPathExcluded(absolutePath, watchPathsExcluded)) {
      fsWatch(absolutePath, { recursive: true }, (_, filename) => {
        if (!filename) return

        const completePath = resolveCompletePath(absolutePath, filename)

        if (filename && !isPathExcluded(completePath, watchPathsExcluded)) {
          handleChange(filename)
        }
      })
    }
  })
}

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

export async function watcher({
  buildConfig,
  clients,
  scriptPaths,
  watchPaths = [],
  serverConfig,
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

  const handleChange = async (filename?: string) => {
    if (filename && isPathExcluded(filename, serverConfig.watchPathsExcluded || [])) {
      return
    }

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

  watchWithExclusions({ resolvedPaths, handleChange, serverConfig })
}
