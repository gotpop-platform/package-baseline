interface BrowserOptions {
  browser?: "chrome" | "firefox" | "safari"
  newWindow?: boolean
  url?: string
  index?: number
}

// connections.ts
class ConnectionTracker {
  private tabs = new Set<string>()

  addTab(id: string) {
    this.tabs.add(id)
  }

  removeTab(id: string) {
    this.tabs.delete(id)
  }

  getTabCount() {
    return this.tabs.size
  }
}

export const connections = new ConnectionTracker()

export const openBrowser = async (url: string, options: BrowserOptions = {}) => {
  // Check if any tabs are already open
  if (connections.getTabCount() > 0) return

  const { browser } = options
  const args = ["open"]

  if (browser) args.push("-a", browser)
  args.push(url)

  const proc = Bun.spawn(args, {
    stdio: ["inherit", "inherit", "inherit"],
  })

  await proc.exited
}

// // Update WebSocket handlers
// export const handleWSOpen = (ws: WebSocket) => {
//   const tabId = crypto.randomUUID()
//   ws.data = { tabId }
//   connections.addTab(tabId)
// }

// export const handleWSClose = (ws: WebSocket) => {
//   connections.removeTab(ws.data.tabId)
// }
