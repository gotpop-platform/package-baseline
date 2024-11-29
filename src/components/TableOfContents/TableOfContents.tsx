import { jsxFactory } from "@gotpop-platform/package-jsx-factory";
import {
  useCSS
} from "@gotpop-platform/package-utilities";

export const TableOfContents = ({ toc }: { toc?: { id: string; text: string }[] }) => {
  const { css, useName } = useCSS({ meta: import.meta })

  return (
    <nav>
      <style>{css}</style>
      <ul>
        {toc?.map(({ id, text }) => (
          <li>
            <a href={"#" + id}>{text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
