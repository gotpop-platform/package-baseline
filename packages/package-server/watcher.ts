import { cwd, env } from "process"
import { join, resolve } from "path"

import { BuildConfig } from "bun"
import { WatcherProps } from "./types"
import { contentMap } from "../package-markdown"
import { getRelativePaths } from "./build"
import { logger } from "../package-logger"
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
  const root = env.PROJECT_ROOT

  if (!root) {
    throw new Error("PROJECT_ROOT is not defined")
  }

  const watcher = watch(join(root, "packages/client/src"), { recursive: true })

  const location = cwd()

  for await (const { filename } of watcher) {
    // console.log("filename :", filename)
    if (filename?.includes("src")) {
      logger({ msg: `Content changed: ${filename}`, styles: ["yellow"] })

      if (filename.match(/\.(css|js|ts)$/)) {
        const { success, buildResponse } = await rebuildFiles({ buildConfig })
        console.log("buildResponse :", buildResponse)

        if (success) {
          logger({ msg: "Build successful", styles: ["green"] })
          scriptPaths.length = 0

          if (buildResponse) {
            console.log("...getRelativePaths(buildResponse :", ...getRelativePaths(buildResponse))
            scriptPaths.push(...getRelativePaths(buildResponse))
            console.log("scriptPaths :", scriptPaths)
          }
        } else {
          buildResponse.logs.forEach((log: any) => {
            logger({ msg: log, styles: ["red"] })
          })
        }

        store.currentContent = await contentMap()

        for (const client of clients) {
          client.send("reload")
        }
      }
    }
  }
}
