export type MDXNode = {
  type: "jsx" | "markdown" | "code"
  content: string
  language?: string
  children?: MDXNode[]
}

export type MDXComponent = {
  name: string
  props: Record<string, any>
  children?: (MDXComponent | string)[]
}

const MDXParser = {
  parse(source: string): MDXNode[] {
    const nodes: MDXNode[] = []
    const lines = source.split("\n")
    let current = ""
    let inJSX = false
    let inCode = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle import/export statements
      if (line.startsWith("import ") || line.startsWith("export ")) {
        if (current) {
          nodes.push({ type: "markdown", content: current })
          current = ""
        }
        nodes.push({ type: "jsx", content: line })
        continue
      }

      // Handle JSX blocks
      if (line.includes("{") && !inCode) {
        inJSX = true
        if (current) {
          nodes.push({ type: "markdown", content: current })
          current = ""
        }
        current += line + "\n"
        continue
      }

      if (line.includes("}") && inJSX) {
        inJSX = false
        current += line
        nodes.push({ type: "jsx", content: current })
        current = ""
        continue
      }

      // Handle code blocks
      if (line.startsWith("```")) {
        if (!inCode) {
          inCode = true
          if (current) {
            nodes.push({ type: "markdown", content: current })
            current = ""
          }
        } else {
          inCode = false
          nodes.push({ type: "code", content: current, language: line.slice(3) })
          current = ""
        }
        continue
      }

      current += line + "\n"
    }

    if (current) {
      nodes.push({ type: inJSX ? "jsx" : "markdown", content: current })
    }

    return nodes
  },

  render(nodes: MDXNode[]): string {
    return nodes
      .map((node) => {
        switch (node.type) {
          case "jsx":
            return node.content
          case "markdown":
            return `<div>${node.content.replace(/{(.*?)}/g, (_, expr) => eval(expr))}</div>`
          case "code":
            return `<pre><code class="language-${node.language}">${node.content}</code></pre>`
          default:
            return ""
        }
      })
      .join("\n")
  },
}

export default MDXParser
