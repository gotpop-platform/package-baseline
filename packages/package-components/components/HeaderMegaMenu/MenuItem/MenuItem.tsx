import { TriggerSubMenu } from "../TriggerSubMenu"
import { jsxFactory } from "../../../../package-jsx-factory"
import { useCSS } from "../../../../package-utilities"

export const MenuItem = ({
  children,
  position,
  textButton,
  href,
  subMenuItems,
}: {
  children?: string
  position: string
  textButton: string
  href: string
  subMenuItems: Array<{
    title: string
    link: string
  }> | null
}): JSX.Element => {
  const { css } = useCSS({ meta: import.meta })

  return (
    <li
      class="menu-item"
      id={`menu-items-${position}`}
      style={`--menuItemAnchor: --list-item-${position}`}
    >
      <style>{css}</style>
      <div class="pill">
        <TriggerSubMenu
          position={position}
          textButton={textButton}
          href={href}
          subMenuItems={subMenuItems}
        />
      </div>
      {children}
    </li>
  )
}
