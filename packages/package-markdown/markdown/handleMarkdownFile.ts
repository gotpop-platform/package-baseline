import { join } from "path"
import { readFileSync } from "fs"

export const constructFilePath = (directoryPath: string, fileName: string): string =>
  join(directoryPath, `${fileName}.md`)

type ReadFileContent = {
  fileMarkdownContent: string
}

export const readFileContent = (filePath: string): ReadFileContent => {
  if (!filePath) {
    throw new Error(`File not found: ${filePath}`)
  }

  const fileMarkdownContent = readFileSync(filePath, "utf-8")

  return { fileMarkdownContent }
}
