import { Fragment } from "../../package-components"
import type { MarkdownFileProps } from "../../package-markdown"
import { jsxFactory } from "../../package-jsx-factory"

type ComponentProps = {
  markdownItems: Map<string, MarkdownFileProps> | MarkdownFileProps
  layout: (markdownItem: MarkdownFileProps) => Record<string, string | number>[]
}

type WrappedProps = {
  markdownFile: MarkdownFileProps
  layout: Record<string, string | number>
}

export function withItems(Component: (props: WrappedProps) => any) {
  return function WrappedComponent({ markdownItems, layout }: ComponentProps) {
    const items: JSX.Element[] = []
    let index = 0

    const processMarkdownItems = (
      markdownItem: MarkdownFileProps | Map<string, MarkdownFileProps>
    ) => {
      if (markdownItem instanceof Map) {
        for (const [key, nestedItem] of markdownItem.entries()) {
          processMarkdownItems(nestedItem)
        }
      } else {
        const layoutArray = layout(markdownItem)
        const layoutItem = layoutArray[index]

        if (!layoutItem) {
          console.error(`Layout item at index ${index} is undefined`)
          items.push(<div>Error: Layout item is undefined</div>)
        } else {
          items.push(<Component markdownFile={markdownItem} layout={layoutItem} />)
        }
        index++
      }
    }

    processMarkdownItems(markdownItems)

    return <>{items}</>
  }
}
