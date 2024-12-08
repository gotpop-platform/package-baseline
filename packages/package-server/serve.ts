import { type BuildConfig, type Server, build, serve } from "bun"
import { clients, handleWSClose, handleWSMessage, handleWSOpen } from "./websocket"

import type { ServerConfig } from "./types"
import { contentMap } from "../package-markdown"
import { handleRequests } from "./handleRequests"
import { logger } from "../package-logger"
import store from "./store"
import { watcher } from "./watcher"

const { env } = process

const serverConfig: ServerConfig = {
  hostname: "::",
  development: env.NODE_ENV === "development",
  port: Number(env.npm_package_config_server_port),
}

type StartServerOptions = {
  buildConfig: BuildConfig
  watchPaths: string[]
}

export async function startServer({ buildConfig, watchPaths }: StartServerOptions) {
  store.buildResponse = await build(buildConfig)
  store.currentContent = await contentMap()

  const server = serve({
    ...serverConfig,
    async fetch(request: Request, server: Server) {
      return handleRequests({ request, server })
    },
    websocket: {
      open: handleWSOpen,
      close: handleWSClose,
      message: handleWSMessage,
    },
  })

  await watcher({
    buildConfig,
    clients,
    scriptPaths: store.scriptPaths,
    watchPaths,
  })

  logger(
    { msg: "Server running at:", styles: ["green", "bold"] },
    { msg: `http://localhost:${server.port}`, styles: ["dim"] }
  )
}
