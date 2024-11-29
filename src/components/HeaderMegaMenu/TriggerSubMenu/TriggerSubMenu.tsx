import { jsxFactory } from "@gotpop-platform/package-jsx-factory"
import { useCSS } from "@gotpop-platform/package-utilities"

export const Fragment = ({ children }: { children?: JSX.Element }) => children || null

export const TriggerSubMenu = ({
  position,
  textButton,
  href,
  subMenuItems,
}: {
  position?: string
  textButton?: string
  href?: string
  subMenuItems?: Array<{
    title: string
    link: string
  }> | null
}) => {
  const { css } = useCSS({ meta: import.meta })

  return (
    <Fragment>
      <a href={href} class="menu-link" id={`menu-toggle-${position}`}>
        <style>{css}</style>
        <span>{textButton}</span>
      </a>
      {subMenuItems && (
        <button
          popovertarget={`sub-menu-${position}`}
          class="menu-toggle"
          aria-haspopup="true"
          aria-label="Open submenu"
        />
      )}
    </Fragment>
  )
}
