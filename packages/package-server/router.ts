import { INTERNAL_SERVER_ERROR_RESPONSE, NOT_FOUND_RESPONSE, importModule } from "."

import { join } from "path"
import { logger } from "@/gotpop-platform/package-logger"
import { timeFunction } from "../package-utilities"

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
  style: (env.npm_package_config_server_router_style || "nextjs") as "nextjs",
  dir: join(env.PROJECT_ROOT || "", env.npm_package_config_dir_pages || "pages"),
})

export const handleGetPages = async (data: PageProps): Promise<Response> => {
  try {
    const route = router.match(data.request)

    if (!route) {
      return NOT_FOUND_RESPONSE
    }

    const module = await importModule<ModuleType>(route.filePath)

    if (!module) {
      return NOT_FOUND_RESPONSE
    }

    if (typeof module.default !== "function") {
      logger({
        msg: "Default export is not a function:",
        styles: ["bold", "red"],
      })
      return INTERNAL_SERVER_ERROR_RESPONSE
    }

    const response = await timeFunction("Default page load time in ms", () =>
      module.default({
        ...data,
        query: route.params,
      })
    ).catch((error: Error) => {
      logger({ msg: String(error), styles: ["bold", "red"] })
      return null
    })

    if (!response) {
      return NOT_FOUND_RESPONSE
    }

    return new Response(response, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    logger({ msg: String(error), styles: ["bold", "red"] })
    return INTERNAL_SERVER_ERROR_RESPONSE
  }
}
