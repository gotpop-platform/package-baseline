import { join, relative } from "path"

import { promises as fs } from "fs"
import { logger } from "../package-logger"

const { env } = process

export async function copyFiles({
  source,
  destination,
  silent = false,
}: {
  source: string
  destination: string
  silent: boolean
}) {
  try {
    // Normalize paths
    const destinationShortened = destination.replace(env.PROJECT_ROOT || "", "")

    // Check if source exists
    try {
      await fs.access(source)
    } catch (error) {
      throw new Error(`Source path does not exist: ${source}`)
    }

    // Create destination directory
    try {
      await fs.mkdir(destination, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create destination directory: ${(error as Error).message}`)
    }

    // Read directory contents
    let entries
    try {
      entries = await fs.readdir(source, { withFileTypes: true })
    } catch (error) {
      throw new Error(`Failed to read source directory: ${(error as Error).message}`)
    }

    // Process each entry
    for (const entry of entries) {
      const sourceEntryPath = join(source, entry.name)
      const destinationEntryPath = join(destination, entry.name)
      const relativeSourcePath = relative(process.cwd(), sourceEntryPath)

      try {
        if (entry.isDirectory()) {
          await copyFiles({
            source: relativeSourcePath,
            destination: destinationEntryPath,
            silent,
          })
        } else {
          await fs.copyFile(sourceEntryPath, destinationEntryPath)
          if (!silent) {
            logger(
              { msg: "Copied file:", styles: ["italic"] },
              { msg: entry.name, styles: ["bold", "green"] }
            )
          }
        }
      } catch (error) {
        logger(
          { msg: `Failed to copy ${entry.name}:`, styles: ["bold", "red"] },
          { msg: (error as Error).message, styles: ["bold"] }
        )
        // Continue with next file instead of stopping completely
        continue
      }
    }

    if (!silent) {
      logger(
        { msg: "Completed copying from", styles: ["italic"] },
        { msg: source.replace(env.PROJECT_ROOT || "", ""), styles: ["bold", "red"] },
        { msg: "to", styles: ["dim"] },
        { msg: destinationShortened, styles: ["bold", "green"] }
      )
    }
  } catch (error) {
    logger(
      { msg: "Critical error during copy operation:", styles: ["bold", "red"] },
      { msg: (error as Error).message, styles: ["bold"] }
    )
    throw error // Re-throw to allow handling by caller
  }
}
