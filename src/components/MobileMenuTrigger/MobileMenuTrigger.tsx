import {
  mkClass,
  useCSS
} from "@gotpop-platform/package-utilities"

import { jsxFactory } from "@gotpop-platform/package-jsx-factory"

export function MobileMenuTrigger() {
  const { css } = useCSS({ meta: import.meta })

  return (
    <div class={mkClass(import.meta.file)}>
      <style>{css}</style>
      <div class="inner">
        <button popovertarget="headerMegaMenu">Open!</button>
      </div>
    </div>
  )
}
