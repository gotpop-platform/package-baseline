import { file } from "bun"
import { join } from "path"
import { logger } from "../package-logger"

const { env } = process

export async function handleStaticAssets({ path, publicDir }: { path: string; publicDir: string }) {
  const fullPath = join(env.PROJECT_ROOT || "", publicDir, path)
  // console.log("fullPath :", fullPath)

  try {
    const asset = file(fullPath)

    if (await asset.exists()) {
      return new Response(asset)
    }
  } catch (error) {
    logger({ msg: `Asset not found: ${path}`, styles: ["red"] })
  }
  return null
}
