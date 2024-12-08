import { file } from "bun"
import { join } from "path"
import { logger } from "../package-logger"

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
} as const

interface AssetOptions {
  path: string
  publicDir: string
  maxSize?: number
}

const checkFileSize = (fileSize: number, maxSize: number) => {
  if (maxSize && fileSize > maxSize) {
    logger({
      msg: `File size ${fileSize} exceeds limit of ${maxSize} bytes`,
      styles: ["red"],
    })
    return new Response("File too large", {
      status: 413,
      statusText: "Payload Too Large",
    })
  }
  return null
}

export async function handleStaticAssets({ path, publicDir, maxSize = 5_242_880 }: AssetOptions) {
  try {
    const filePath = join(publicDir, path)
    const f = file(filePath)
    const size = f.size

    const sizeCheckResult = checkFileSize(size, maxSize)

    if (sizeCheckResult instanceof Error) {
      return sizeCheckResult
    }

    const ext = path.substring(path.lastIndexOf("."))
    const contentType = MIME_TYPES[ext as keyof typeof MIME_TYPES] || "application/octet-stream"

    return new Response(f, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": size.toString(),
      },
    })
  } catch (error) {
    logger({
      msg: `Error handling asset: ${error}`,
      styles: ["red"],
    })
    return null
  }
}
