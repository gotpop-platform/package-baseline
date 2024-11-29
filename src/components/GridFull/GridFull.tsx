import { cn, mkClass, useCSS } from "@gotpop-platform/package-utilities"

import { jsxFactory } from "@gotpop-platform/package-jsx-factory"

type GridFullProps = {
  isRoot?: boolean
  children?: string
}

export const GridFull = ({ isRoot = false, children }: GridFullProps) => {
  const { css } = useCSS({ meta: import.meta })
  const cl = mkClass(import.meta.file)

  return (
    <div
      class={cn(cl, {
        "root-grid": isRoot,
      })}
    >
      <style>{css}</style>
      {children}
    </div>
  )
}
