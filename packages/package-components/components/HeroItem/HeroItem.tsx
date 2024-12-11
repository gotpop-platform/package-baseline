import { jsxFactory } from "../../../package-jsx-factory"
import { useCSS } from "../../../package-utilities"

export function HeroItem({
  children,
  isMain = false,
  hasInner = false,
  ...rest
}: {
  children?: string | string | (string | string)[]
  isMain?: boolean
  hasInner?: boolean
  [key: string]: any
}): JSX.Element {
  const { css } = useCSS({ meta: import.meta })

  return (
    <div class="hero-item" {...rest}>
      <style>{css}</style>
      <section class="section">
        <h1>Precision layouts for the discerning developer</h1>
        <p>A modern build system.</p>
      </section>
    </div>
  )
}
