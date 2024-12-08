import type { Server } from "bun"
import { env } from "process"
import { handleGetPages } from "./router"
import { handleStaticAssets } from "./handleAssets"
import { logger } from "../package-logger"
import store from "./store"

export async function handleRequests({ request, server }: { request: Request; server: Server }) {
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

  const ALLOWED_EXTENSIONS = [".js", ".css", ".woff2", ".png", ".jpg", ".svg", ".ico"]
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  if (ALLOWED_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    try {
      // Sanitize and validate path
      const cleanPath = url.pathname.replace(/\.\./g, "")
      if (!cleanPath.match(/^[/\w.-]+$/)) {
        return new Response("Invalid asset path", {
          status: 400,
          statusText: "Bad Request",
        })
      }

      const publicDir = env.npm_package_config_dir_public || "./public"

      if (!publicDir) {
        throw new Error("Public directory not configured")
      }

      const assetResponse = await handleStaticAssets({
        path: cleanPath,
        publicDir,
        maxSize: MAX_FILE_SIZE,
      })

      if (!assetResponse) {
        return new Response("Asset not found", {
          status: 404,
          statusText: "Not Found",
        })
      }

      // Add caching headers
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

  // Page handling
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
