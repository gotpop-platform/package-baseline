import { join } from "path"
import { type BunPlugin } from "bun"
import { logger } from "../package-logger"

import type { CopyFilesPluginOptions } from "./types"
import { copyFiles } from "./copy-files"

export const createCopyFilesPlugin = (options: CopyFilesPluginOptions): BunPlugin => ({
  name: "copy-assets",
  async setup(build) {
    const {
      inputDir = "src",
      outputDir = "dist",
      directories,
      patterns = ["**/*"],
      exclude = [],
      preserveStructure = true,
      flatten = false,
      onFile,
      onDir,
      verbose = false,
      silent = false,
    } = options

    if (!silent) logger({ msg: "Copying assets...", styles: ["bold", "bgYellowBright"] })

    let fileCheck
    // console.log("directories :", directories)

    try {
      for (const directory of directories) {
        const destination = join(
          outputDir,
          preserveStructure ? directory.replace(inputDir, "") : ""
        )

        if (onDir) await onDir(directory, destination)

        // console.log("destination :", destination)
        const path = join(inputDir, directory)
        // console.log("path :", path)
        fileCheck = destination
        console.log("destination 33 :", destination)

        await copyFiles({
          source: path,
          destination,
          silent,
        })
      }

      if (!silent)
        logger({
          msg: "Finished copying assets",
          styles: ["bold", "bgGreenBright"],
        })
    } catch (error) {
      logger({ msg: `Files not copied! ${fileCheck}`, styles: ["bold", "red"] })
      logger({ msg: `Files not copied! ${String(error)}`, styles: ["bold", "red"] })
    }
  },
})
