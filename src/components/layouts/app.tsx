import { Head } from "../Head"
import { jsxFactory } from "../../package-jsx-factory"

interface AppProps {
  children?: string | JSX.Element | JSX.Element[]
  title: string
  scriptPaths: Record<string, string>[]
}

export const AppTheme = ({ title, scriptPaths, children }: AppProps) => {
  const doc = "<!DOCTYPE html>"

  return (
    doc +
    (
      <html lang="en">
        <Head title={title} scriptPaths={scriptPaths} />
        <body class="body">{children}</body>
      </html>
    )
  )
}
