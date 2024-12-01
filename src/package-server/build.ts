import { BuildArtifact, BuildOutput, Loader } from "bun"

import { contentMap } from "../package-markdown"
import { createCopyFilesPlugin } from "../bun-plugin-copy-assets"
import { logger } from "../package-logger"
import store from "./store"

type ExtendedLoader = Loader | "css"
type BuildArtifactType = Omit<BuildArtifact, "loader"> & { loader: ExtendedLoader }

export const buildConfig = {
  entrypoints: [
    "src/assets/js/script.ts",
    "src/assets/js/worklets/worklet.grid.ts",
    "src/assets/js/worklets/worklet.hero.ts",
    // "src/assets/styles/index.css", // CSS parsing is still patchy
  ],
  outdir: "dist",
  root: "./src",
  naming: "[dir]/[name]-[hash].[ext]",
  experimentalCss: true,
  plugins: [
    createCopyFilesPlugin({
      inputDir: "src/assets",
      outputDir: "dist/assets",
      directories: ["fonts", "styles", "img"],
      preserveStructure: true,
      verbose: false,
      silent: false,
      onFile: async (src, dest) => {
        console.log(`Processing: ${src}`)
      },
    }),
  ],
}

export const getRelativePaths = (buildOutput: BuildOutput) => {
  const baseDir = process.cwd() + "/dist"

  return buildOutput.outputs
    .filter((output: BuildArtifactType) => !output.path.includes(".woff2"))
    .map((output: BuildArtifactType) => {
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

      logger({ msg: "Build complete", styles: ["green", "bold"] })
      logger({ msg: "Output:", styles: ["dim"] }, { msg: rootPath, styles: ["blue"] })

      return {
        entryPoint,
        hashedPath: rootPath,
        type,
      }
    })
}

export async function rebuildFiles() {
  console.time("rebuildFiles")
  try {
    store.buildResponse = await Bun.build(buildConfig)
    // console.log("store.buildResponse :", store.buildResponse)
    console.timeEnd("rebuildFiles")
    return { success: true, buildResponse: store.buildResponse }
  } catch (error) {
    logger({ msg: `Build failed: ${error}`, styles: ["red"] })
    console.timeEnd("rebuildFiles")
    return { success: false, error }
  }
}
