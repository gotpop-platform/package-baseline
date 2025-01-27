import { Fragment } from "../.."
import { Head } from "../Head"
import { env } from "process"
import { jsxFactory } from "../../../package-jsx-factory"
import { title as mkTitle } from "packages/package-utilities"

interface AppProps {
  children?: string | string | string[]
  title: string
  scriptPaths: Record<string, string>[]
  home?: boolean
}

export const AppHome = ({ title, scriptPaths, home, children }: AppProps): JSX.Element => {
  const doc = "<!DOCTYPE html>"

  return (
    <>
      {doc}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="keywords" content="HTML, CSS, JavaScript" />
          <meta name="author" content="GotPop"></meta>
          <title>{mkTitle(title)}</title>
          <link rel="icon" href="./assets/img/favicon.png" />
          <link rel="stylesheet" href="./assets/styles/index.css" />
          <script type="module" src="./assets/scripts/script.js" />
          <script>{`CSS.paintWorklet.addModule('/assets/scripts/worklets/worklet.grid.js');`}</script>
          <script>{`CSS.paintWorklet.addModule('/assets/scripts/worklets/worklet.hero.js');`}</script>
          {env.NODE_ENV === "development" ? (
            <script>
              {`
          const ws = new WebSocket('ws://localhost:${env.npm_package_config_server_port}');
          
          ws.onmessage = (event) => {
            console.log('🔄 Reloading page...');
            window.location.reload(true);
          };
          
          ws.onclose = () => {
            console.log('WebSocket disconnected');
            // Try to reconnect after a delay
            setTimeout(() => {
              window.location.reload(true);
            }, 1000);
          };
        `}
            </script>
          ) : null}
          {env.NODE_ENV === "production" ? (
            <script type="speculationrules">
              {`{
            "prerender": [
              {
                "urls": [
                  "/", 
                  "features/feature-1", 
                  "features/feature-2", 
                  "features/feature-3", 
                  "features/feature-4", 
                  "features/feature-5", 
                  "features/feature-6",
                  "features",
                  "docs",
                  "components",
                ]
              }
            ]
        }`}
            </script>
          ) : null}
        </head>
        <body class="body">{children}</body>
      </html>
    </>
  )
}
