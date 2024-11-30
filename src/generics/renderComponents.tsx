import { jsxFactory } from "../package-jsx-factory"
import { type SectionType } from "@gotpop-platform/package-markdown"

type SectionRender = Pick<SectionType, "sectionHtml" | "sectionComponents">

const PACKAGES = "../components"

const componentsMapping: {
  [key: string]: () => Promise<any>
} = {
  Button: () =>
    import(PACKAGES + "/forms/Button").then((mod) => {
      // console.log("mod :", mod)

      return mod.Button
    }),
  Heading: () => import(PACKAGES).then((mod) => mod.Heading),
  CodeBlock: () => import(PACKAGES).then((mod) => mod.CodeBlock),
}

async function loadComponent(componentName: string) {
  if (componentName in componentsMapping) {
    return componentsMapping[componentName]()
  }

  throw new Error(`Component ${componentName} not found`)
}

export async function renderComponents({ sectionHtml, sectionComponents }: SectionRender) {
  const codeBlockRegex = /(__CODE_BLOCK_\d+__|__SHORTCODE_\d+__)/g
  const parts = sectionHtml.split(codeBlockRegex)

  const mapParts = parts.map(async (part, index) => {
    const match = part.match(codeBlockRegex)

    if (!match) return part

    const blockKey = match[0]
    if (!sectionComponents?.has(blockKey)) return part

    const block = sectionComponents.get(blockKey)

    if (!block) return part

    if (block.component) {
      try {
        const Component = await loadComponent(block.component)
        const componentProps = block.props ?? {}

        return (
          <Component {...(typeof componentProps === "object" ? componentProps : {})}>
            {block.children}
          </Component>
        )
      } catch (error) {
        console.error(error)

        return part
      }
    }

    return part
  })

  const finalContent = await Promise.all(mapParts)

  return { finalContent }
}
