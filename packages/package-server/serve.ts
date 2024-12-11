import {
  clients,
  handleRequests,
  handleWSClose,
  handleWSMessage,
  handleWSOpen,
  type StartServerOptions,
  store,
  watcher,
} from "."

import type { Server } from "bun"
import { contentMap } from "@/gotpop-platform/package-markdown"
import { logger } from "@/gotpop-platform/package-logger"

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
