import { BuildConfig, ServerWebSocket } from "bun"

export type ContentMap = Map<string, unknown>
export type WSMessage = string | Buffer

export interface ServerConfig {
  hostname: string
  development: boolean
  port: number
}

export interface WatcherProps {
  clients: Set<ServerWebSocket<unknown>>
  scriptPaths: Record<string, string>[]
  buildConfig: BuildConfig
  watchPaths?: string[] // Make optional
}
