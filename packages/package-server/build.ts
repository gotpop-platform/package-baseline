import * as path from "path"

import { BuildArtifact, BuildOutput, Loader } from "bun"

import { logger } from "../package-logger"

type ExtendedLoader = Loader | "css"
type BuildArtifactType = Omit<BuildArtifact, "loader"> & { loader: ExtendedLoader }

const { env } = process
const baseDir = path.join(env.PROJECT_ROOT || "", env.npm_package_config_dir_public || "")

export const getRelativePaths = ({ outputs }: BuildOutput) => {
  if (!outputs || !Array.isArray(outputs)) {
    logger({
      msg: "Invalid build output: outputs array is missing or invalid",
      styles: ["red"],
    })
    return []
  }

  try {
    return outputs.map((output: BuildArtifactType) => {
      if (!output.path) {
        throw new Error("Output path is missing")
      }

      const rootPath = output.path.replace(baseDir, "/").replace(/^\//, "")
      const pathParts = output.path.split("/")
      const fileName = pathParts[pathParts.length - 1]

      if (!fileName) {
        throw new Error("Invalid file path structure")
      }

      const entryPoint = fileName.replace(/-[a-z0-9]+\.js$/, ".ts") || ""
      const type = output.path.includes("worklet.")
        ? "worklet"
        : output.loader === "css"
        ? "css"
        : "script"

      return {
        entryPoint,
        hashedPath: rootPath,
        type,
      }
    })
  } catch (error) {
    logger({
      msg: `Error processing build outputs: ${
        error instanceof Error ? error.message : String(error)
      }`,
      styles: ["red"],
    })
    return []
  }
}
