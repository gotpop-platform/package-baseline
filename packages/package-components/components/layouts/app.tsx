import { Head } from "../Head"
import { jsxFactory } from "../../../package-jsx-factory"

interface AppProps {
  children?: string | string | string[]
  title: string
  scriptPaths: Record<string, string>[]
}

const Fragment = ({ children }: { children?: string }): string => children || ""

export const AppTheme = ({ title, scriptPaths, children }: AppProps): JSX.Element => {
  const doc = "<!DOCTYPE html>"

  return (
    <>
      {doc}
      <html lang="en">
        <Head title={title} scriptPaths={scriptPaths} />
        <body class="body">{children}</body>
      </html>
    </>
  )
}
