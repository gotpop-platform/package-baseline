import { getMarkdownFile, parseMarkdownFile } from "./parseMarkdownFile"
import { join, parse } from "path"

import { Glob } from "bun"

const { env } = process

const findMarkdownFiles = async (file: string): Promise<string[]> => {
  const glob = new Glob("**/*.md")
  const markdownFiles: string[] = []

  const contentDir = join(process.cwd(), file)

  for await (const file of glob.scan(contentDir)) {
    markdownFiles.push(file)
  }

  return markdownFiles
}

export const parseMarkdownFiles = async (dir: string) => {
  const foundFiles: string[] = await findMarkdownFiles(dir)

  const mapFiles = foundFiles.map(async (filePath) => {
    const path = filePath.replace(/\.md$/, "")

    const { pageMetadata, htmlSectionsMap } = parseMarkdownFile(dir, path)

    return { pageMetadata, htmlSectionsMap }
  })

  const parsedFiles = await Promise.all(mapFiles)

  return parsedFiles
}

const setNestedMap = (map: Map<string, any>, keys: string[], value: any) => {
  const key = keys.shift()
  if (!key) return

  if (!map.has(key)) {
    map.set(key, new Map<string, any>())
  }

  if (keys.length === 0) {
    map.set(key, value)
  } else {
    setNestedMap(map.get(key), keys, value)
  }
}

const IGNORED_DIRS = ["content"]

export const contentMap = async () => {
  const ROOT = env.PROJECT_ROOT || ""
  const DIR_CONTENT = join(ROOT, env.npm_package_config_dir_content || "")

  const glob = new Glob("**/*.md")
  const contentMap = new Map<string, any>()

  for await (const file of glob.scan(DIR_CONTENT)) {
    const relativePath = file.replace(DIR_CONTENT + "/", "")
    const pathParts = relativePath
      .split("/")
      .filter((part) => !IGNORED_DIRS.includes(part.toLowerCase()))

    const fileName = pathParts.pop()
    const fileKey = fileName ? parse(fileName).name : ""

    const content = getMarkdownFile(join(DIR_CONTENT, file))

    setNestedMap(contentMap, pathParts.concat(fileKey), content)
  }

  return contentMap
}
