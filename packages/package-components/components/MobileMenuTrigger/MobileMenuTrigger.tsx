import {
  mkClass,
  useCSS
} from "../../../package-utilities"

import { jsxFactory } from "../../../package-jsx-factory"

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
