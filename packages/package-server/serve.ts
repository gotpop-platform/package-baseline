import { type BuildConfig, type Server } from "bun"
import { clients, handleWSClose, handleWSMessage, handleWSOpen } from "./websocket"

import type { ServerConfig } from "./types"
import { contentMap } from "../package-markdown"
import { handleRequests } from "./handleRequests"
import { logger } from "../package-logger"
import { store } from "./store"
import { watcher } from "./watcher"

const { env } = process

type StartServerOptions = {
  buildConfig: BuildConfig
  serverConfig: ServerConfig
}

export async function startServer({ buildConfig, serverConfig }: StartServerOptions) {
  store.buildResponse = await Bun.build(buildConfig)
  store.currentContent = await contentMap()

  const server = Bun.serve({
    ...serverConfig,
    async fetch(request: Request, server: Server) {
      return handleRequests({ request, server, serverConfig })
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
    watchPaths: serverConfig.watchPaths,
  })

  logger(
    { msg: "Server running at:", styles: ["green", "bold"] },
    { msg: `http://localhost:${server.port}`, styles: ["dim"] }
  )
}
