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

import type { BunFile } from "bun"
import { homePage } from "../../../site-baseline/src/blocks/Home/Home"

import type { Server } from "bun"
import { contentMap } from "../package-markdown"
import { logger } from "../package-logger"
import * as path from "path"

async function renderHomepage(store: { currentContent: any; scriptPaths: any }) {
  // Home start
  const component = homePage({
    allContent: store.currentContent,
    scriptPaths: store.scriptPaths,
  })

  await Bun.write("./dist/index.html", component as BunFile)

  const siteRoot = process.env.SITE_ROOT ?? process.cwd()
  const homePath = path.join(siteRoot, "dist", "index.html")
  const homepage = await import(homePath)
  // Home end

  return homepage.default
}

export async function startServer({ buildConfig, serverConfig }: StartServerOptions) {
  store.buildResponse = await Bun.build(buildConfig)
  store.currentContent = await contentMap()

  const theHomepage = await renderHomepage(store)

  const server = Bun.serve({
    ...serverConfig,
    static: {
      "/": theHomepage,
    },
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
    serverConfig,
  })

  logger(
    { msg: "Server running at:", styles: ["green", "bold"] },
    { msg: `http://localhost:${server.port}`, styles: ["dim"] }
  )
}
