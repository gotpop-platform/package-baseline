import * as path from "path"

import { BuildArtifact, BuildOutput, Loader } from "bun"

import { logger } from "../package-logger"

type ExtendedLoader = Loader | "css"
type BuildArtifactType = Omit<BuildArtifact, "loader"> & { loader: ExtendedLoader }

const { env, cwd } = process
const baseDir = path.join(env.PROJECT_ROOT || "", env.npm_package_config_dir_public || "")

export const getRelativePaths = ({ outputs }: BuildOutput) =>
  outputs.map((output: BuildArtifactType) => {
    const rootPath = output.path.replace(baseDir, "/").replace(/^\//, "")
    const entryPoint =
      output.path
        .split("/")
        .pop()
        ?.replace(/-[a-z0-9]+\.js$/, ".ts") || ""

    const type = output.path.includes("worklet.")
      ? "worklet"
      : output.loader === "css"
      ? "css"
      : "script"

    logger({ msg: "Build Output:", styles: ["dim"] }, { msg: rootPath, styles: ["blue"] })

    return {
      entryPoint,
      hashedPath: rootPath,
      type,
    }
  })
