import { jsxFactory } from "@gotpop-platform/package-jsx-factory"
import { useCSS } from "@gotpop-platform/package-utilities"

type ButtonProps = {
  href: string
  children?: string | JSX.Element | JSX.Element[]
}

export const Button = ({ href, children }: ButtonProps) => {
  const { css, useName } = useCSS({ meta: import.meta })

  return (
    <a class={useName + " link-button"} href={href}>
      <style>{css}</style>
      {children}
    </a>
  )
}
