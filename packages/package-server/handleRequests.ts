import type { BuildConfig, Server } from "bun"

import { ServerConfig } from "./types"
import { env } from "process"
import { existsSync } from "fs"
import { handleGetPages } from "./router"
import { handleStaticAssets } from "./handleAssets"
import { join } from "path"
import { logger } from "@/gotpop-platform/package-logger"
import { store } from "./store"

const ALLOWED_EXTENSIONS = [".js", ".css", ".woff2", ".png", ".jpg", ".svg", ".ico"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function handleRequests({
  request,
  server,
  serverConfig,
}: {
  request: Request
  server: Server
  serverConfig: ServerConfig
}) {
  const url = new URL(request.url)

  if (request.headers.get("upgrade") === "websocket") {
    try {
      const success = await server.upgrade(request)

      if (!success) {
        console.error("[WebSocket] Upgrade failed")

        return new Response("WebSocket upgrade failed: Connection could not be established", {
          status: 426,
          statusText: "Upgrade Required",
        })
      }
      return undefined
    } catch (error) {
      console.error("[WebSocket] Error during upgrade:", error)

      return new Response("WebSocket upgrade failed: Internal server error", {
        status: 500,
      })
    }
  }

  if (ALLOWED_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    try {
      const publicDir = join(env.PROJECT_ROOT || "", env.npm_package_config_dir_public || "dist")
      const fullPath = join(publicDir, url.pathname)

      if (!serverConfig.silent) {
        logger({
          msg: `Attempting to serve: ${fullPath}`,
          styles: ["blue"],
        })
      }

      if (!existsSync(fullPath)) {
        logger({
          msg: `File not found: ${fullPath}`,
          styles: ["red"],
        })
        return new Response("Asset not found", {
          status: 404,
          statusText: "Not Found",
        })
      }

      const fileStats = Bun.file(fullPath).size

      if (fileStats > MAX_FILE_SIZE) {
        logger({
          msg: `File too large: ${fullPath} (${fileStats} bytes)`,
          styles: ["red"],
        })
        return new Response("File too large", {
          status: 413,
          statusText: "Payload Too Large",
        })
      }

      const assetResponse = await handleStaticAssets({
        path: url.pathname,
        publicDir,
      })

      if (!assetResponse) {
        logger({
          msg: `Failed to handle asset: ${fullPath}`,
          styles: ["red"],
        })

        return new Response("Asset not found", {
          status: 404,
          statusText: "Not Found",
        })
      }

      const headers = new Headers(assetResponse.headers)

      headers.set("Cache-Control", "public, max-age=31536000")
      headers.set("X-Content-Type-Options", "nosniff")

      return new Response(assetResponse.body, {
        status: 200,
        headers,
      })
    } catch (error) {
      logger({
        msg: `[Static Assets] Error: ${error}`,
        styles: ["red"],
      })

      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      return new Response(`Error serving static asset: ${errorMessage}`, {
        status: 500,
        statusText: "Internal Server Error",
      })
    }
  }

  try {
    const response = await handleGetPages({
      request,
      allContent: store.currentContent,
      scriptPaths: store.scriptPaths,
    })

    return response
  } catch (error) {
    logger({ msg: `Error handling page: ${error}`, styles: ["red"] })

    return new Response("Internal Server Error", { status: 500 })
  }
}
