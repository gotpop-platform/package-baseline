import { jsxFactory } from "@gotpop-platform/package-jsx-factory"
import { useCSS } from "../../package-utilities"

export function MenuSide({ allPageMetadata }: { allPageMetadata: Map<string, any> }): JSX.Element {
  const { css } = useCSS({ meta: import.meta })

  const toSentenceCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const renderMenuItems = (metadata: Map<string, any>) => {
    if (!metadata) {
      return null
    }

    const theArray = Array.from(metadata?.entries())

    return theArray.map(([key, value]) => {
      if (value instanceof Map) {
        return (
          <li>
            <details id={key} open>
              <summary>{toSentenceCase(key)}</summary>
              <div class="content">
                <ul>{renderMenuItems(value)}</ul>
              </div>
            </details>
          </li>
        )
      } else {
        return (
          <li>
            <a href={`/${value.slug}`}>{value.title}</a>
          </li>
        )
      }
    })
  }

  return (
    <nav class="menu-side">
      <style>{css}</style>
      <ul>{renderMenuItems(allPageMetadata)}</ul>
    </nav>
  )
}
