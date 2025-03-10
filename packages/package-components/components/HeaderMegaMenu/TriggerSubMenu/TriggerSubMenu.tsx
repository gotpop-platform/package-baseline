import { Fragment } from "../../../../package-components"
import { jsxFactory } from "../../../../package-jsx-factory"
import { useCSS } from "../../../../package-utilities"

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
    <>
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
    </>
  )
}
