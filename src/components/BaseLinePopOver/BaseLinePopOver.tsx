import {
  mkClass,
  useCSS
} from "../../package-utilities"

import { jsxFactory } from "../../package-jsx-factory"

export function BaseLinePopOver({ popovertarget = "basegrid" }) {
  const { css } = useCSS({ meta: import.meta })

  return (
    <div class={mkClass(import.meta.file)} id={popovertarget} popover="auto">
      <style>{css}</style>
      <h4>Baseline</h4>
      <p>Click anywhere to dismiss</p>

      <button class="trigger" popovertarget="basegrid" popovertargetaction="hide">
        Close
      </button>
    </div>
  )
}
