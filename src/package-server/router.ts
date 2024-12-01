import { INTERNAL_SERVER_ERROR_RESPONSE, NOT_FOUND_RESPONSE, importModule } from "./routerHelpers"

import { join } from "path"
import { logger } from "../package-logger"

interface PageProps {
  request: Request
  allContent: any
  scriptPaths: Record<string, string>[]
}

interface ModuleType {
  default: (props: PageProps & { query: Record<string, string> }) => Promise<string>
}

const { env } = process
const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: join(process.cwd(), env.npm_package_config_dir_pages || "./src/pages"),
})

export const handleGetPages = async (data: PageProps): Promise<Response> => {
  console.time("handleGetPages")
  try {
    console.time("router.match")
    const route = router.match(data.request)
    console.timeEnd("router.match")

    if (!route) {
      console.timeEnd("handleGetPages")
      return NOT_FOUND_RESPONSE
    }

    console.time("importModule")
    const module = await importModule<ModuleType>(route.filePath)
    console.timeEnd("importModule")

    if (!module) {
      console.timeEnd("handleGetPages")
      return NOT_FOUND_RESPONSE
    }

    if (typeof module.default !== "function") {
      logger({
        msg: "Default export is not a function:",
        styles: ["bold", "red"],
      })
      console.timeEnd("handleGetPages")
      return INTERNAL_SERVER_ERROR_RESPONSE
    }

    console.time("module.default")
    const response = await module
      .default({
        ...data,
        query: route.params,
      })
      .catch((error: Error) => {
        logger({ msg: String(error), styles: ["bold", "red"] })
        console.timeEnd("module.default")
        console.timeEnd("handleGetPages")
        return null
      })
    console.timeEnd("module.default")

    if (!response) {
      console.timeEnd("handleGetPages")
      return NOT_FOUND_RESPONSE
    }

    console.timeEnd("handleGetPages")
    return new Response(response, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    logger({ msg: String(error), styles: ["bold", "red"] })
    console.timeEnd("handleGetPages")
    return INTERNAL_SERVER_ERROR_RESPONSE
  }
}
