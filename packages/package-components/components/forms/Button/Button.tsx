import { jsxFactory } from "../../../../package-jsx-factory"
import { useCSS } from "../../../../package-utilities"

type ButtonProps = {
  href: string
  children?: string | string | string[]
}

export const Button = ({ href, children }: ButtonProps): JSX.Element => {
  const { css, useName } = useCSS({ meta: import.meta })

  return (
    <a class={useName + " link-button"} href={href}>
      <style>{css}</style>
      {children}
    </a>
  )
}
