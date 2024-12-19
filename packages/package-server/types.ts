import { BuildConfig, ServerWebSocket } from "bun"

export type ContentMap = Map<string, unknown>
export type WSMessage = string | Buffer

export interface ServerConfig {
  hostname: string
  development: boolean
  port: number
  watchPaths?: string[]
  watchPathsExcluded?: string[]
  silent: boolean
  mimeTypes: Record<string, string>
  allowedExtensions: string[]
  maxFileSize: number
}

export interface WatcherProps {
  clients: Set<ServerWebSocket<unknown>>
  scriptPaths: Record<string, string>[]
  buildConfig: BuildConfig
  watchPaths?: string[]
  serverConfig: ServerConfig
}

export type StartServerOptions = {
  buildConfig: BuildConfig
  serverConfig: ServerConfig
}
