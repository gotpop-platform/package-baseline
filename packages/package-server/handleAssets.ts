import { file } from "bun"
import { join } from "path"
import { logger } from "../package-logger"

interface AssetOptions {
  path: string
  publicDir: string
  maxSize?: number
  mimeTypes: Record<string, string>
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

export async function handleStaticAssets({
  path,
  publicDir,
  maxSize = 5_242_880,
  mimeTypes,
}: AssetOptions) {
  try {
    const filePath = join(publicDir, path)
    const f = file(filePath)
    const size = f.size

    const sizeCheckResult = checkFileSize(size, maxSize)

    if (sizeCheckResult instanceof Error) {
      return sizeCheckResult
    }

    const ext = path.substring(path.lastIndexOf("."))
    const contentType = mimeTypes[ext as keyof typeof mimeTypes] || "application/octet-stream"

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
