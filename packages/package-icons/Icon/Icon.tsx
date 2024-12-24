import { mkClass, style, useCSS } from "../../package-utilities"

import type { IconName } from "./Icon.types"
import { jsxFactory } from "../../package-jsx-factory"
import { readFileSync } from "fs"

type IconProps = {
  iconName?: IconName
  type?: IconTypes
  size?: number | string
  color?: string
}

export enum IconTypes {
  filled = "filled",
  outlined = "outlined",
  round = "round",
  sharp = "sharp",
  twoTone = "two-tone",
}

function loadSVG(iconName: string, type: IconTypes): string {
  try {
    const svgPath = `${import.meta.dir}/svg/${type}/${iconName}.svg`
    return readFileSync(svgPath, "utf-8")
  } catch (error) {
    console.error(`Error loading SVG for icon ${iconName}:`, error)
    return ""
  }
}

function transformSVG(svg: string, size: number | string): string {
  if (!svg) return ""

  // Replace SVG tag with new attributes and inline styles
  return svg.replace(/<svg([^>]*)>/, `<svg$1 style="width: 100%; height: 100%;">`)
}

export const Icon = ({
  iconName = "home",
  type = IconTypes.filled,
  size = 24,
  color = "currentColor",
}: IconProps) => {
  const cl = mkClass(import.meta.file)
  const rawSvg = loadSVG(iconName, type)
  const transformedSvg = transformSVG(rawSvg, size)

  const sizeValue = typeof size === "number" ? `${size}px` : size

  return (
    <span
      class={`${cl} ${cl}-${iconName}`}
      style={style({
        display: "inline-flex",
        width: sizeValue,
        height: sizeValue,
        fill: color,
      })}
    >
      {transformedSvg}
    </span>
  )
}
