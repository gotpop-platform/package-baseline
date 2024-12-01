import type { Server } from "bun"
import { env } from "process"
import { handleGetPages } from "./router"
import { handleStaticAssets } from "./handleAssets"
import { logger } from "../package-logger"
import store from "./store"

export async function handleRequests({ request, server }: { request: Request; server: Server }) {
  console.time("handleRequests")
  const url = new URL(request.url)

  // Websocket upgrade
  if (request.headers.get("upgrade") === "websocket") {
    console.time("websocketUpgrade")
    const success = server.upgrade(request)
    console.timeEnd("websocketUpgrade")

    if (!success) {
      console.timeEnd("handleRequests")
      return new Response("Websocket upgrade failed", { status: 400 })
    }
    console.timeEnd("handleRequests")
    return undefined
  }

  // Static assets
  if (url.pathname.startsWith("/assets/")) {
    console.time("handleStaticAssets")
    const assetResponse = await handleStaticAssets({
      path: url.pathname,
      publicDir: env.npm_package_config_dir_public || "./public",
    })
    console.timeEnd("handleStaticAssets")

    if (assetResponse) {
      console.timeEnd("handleRequests")
      return assetResponse
    }
  }

  // Page handling
  try {
    console.time("handleGetPages")
    const response = await handleGetPages({
      request,
      allContent: store.currentContent,
      scriptPaths: store.scriptPaths,
    })
    console.timeEnd("handleGetPages")
    console.timeEnd("handleRequests")
    return response
  } catch (error) {
    logger({ msg: `Error handling page: ${error}`, styles: ["red"] })
    console.timeEnd("handleGetPages")
    console.timeEnd("handleRequests")
    return new Response("Internal Server Error", { status: 500 })
  }
}
