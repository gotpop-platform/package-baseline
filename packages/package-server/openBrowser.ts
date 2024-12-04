// openBrowser.ts
interface BrowserOptions {
  browser?: "chrome" | "firefox" | "safari"
  newWindow?: boolean
  url?: string
  index?: number
}

const BROWSER_NAMES: Record<Required<BrowserOptions>["browser"], string> = {
  chrome: "Google Chrome",
  firefox: "Firefox",
  safari: "Safari",
}

const BROWSER_PROCESSES: Record<Required<BrowserOptions>["browser"], string> = {
  chrome: "Google Chrome|chrome",
  firefox: "Firefox|firefox",
  safari: "Safari|safari",
}

async function isProcessRunning(processName: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["pgrep", "-fi", processName], {
      stdout: "pipe",
    })
    const output = await new Response(proc.stdout).text()
    return output.length > 0
  } catch {
    return false
  }
}

async function isUrlOpen(url: string): Promise<boolean> {
  const urlObj = new URL(url)
  const port = urlObj.port || (urlObj.protocol === "https:" ? "443" : "80")

  try {
    const proc = Bun.spawn(["lsof", "-i", `:${port}`, "-sTCP:LISTEN"], {
      stdout: "pipe",
    })
    const output = await new Response(proc.stdout).text()
    return output.length > 0
  } catch {
    return false
  }
}

async function startChromeWithDebugging(): Promise<void> {
  // Kill existing Chrome processes first
  try {
    await Bun.spawn(["pkill", "Google Chrome"]).exited
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch {}

  // Start Chrome with debugging enabled
  const proc = Bun.spawn([
    "open",
    "-n", // Always new instance
    "-a",
    "Google Chrome",
    "--args",
    "--remote-debugging-port=9222",
    "--no-first-run",
  ])

  await proc.exited
  // Give Chrome time to start and setup debugging
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

async function waitForDebuggerConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("http://localhost:9222/json/version")
      if (response.ok) return true
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  return false
}

async function findChromeTab(targetUrl: string): Promise<boolean> {
  try {
    let response = await fetch("http://localhost:9222/json")

    if (!response.ok) {
      await startChromeWithDebugging()
      const connected = await waitForDebuggerConnection()
      if (!connected) return false

      response = await fetch("http://localhost:9222/json")
    }

    const tabs = await response.json()
    const matchingTab = tabs.find((tab: any) => {
      return tab.type === "page" && tab.url && new URL(tab.url).href.includes(targetUrl)
    })

    if (matchingTab) {
      await fetch(`http://localhost:9222/json/activate/${matchingTab.id}`)
      return true
    }

    return false
  } catch (error) {
    console.error("Debug connection error:", error)
    return false
  }
}

async function getTabs(): Promise<any[]> {
  try {
    const response = await fetch("http://localhost:9222/json")
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

async function closeTab(tabId: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:9222/json/close/${tabId}`)
    return response.ok
  } catch {
    return false
  }
}

export async function closeTabsWithUrl(targetUrl: string): Promise<boolean> {
  const tabs = await getTabs()
  if (!tabs.length) return false

  const matchingTabs = tabs.filter(
    (tab) => tab.type === "page" && tab.url && new URL(tab.url).href.includes(targetUrl)
  )

  for (const tab of matchingTabs) {
    await closeTab(tab.id)
  }

  return matchingTabs.length > 0
}

export const openBrowser = async (url: string, options: BrowserOptions = {}) => {
  const { browser, newWindow } = options

  if (browser === "chrome" && !newWindow) {
    // Close matching tabs if requested
    await closeTabsWithUrl(url)
  }

  const args = ["open"]
  if (browser) {
    args.push("-a", BROWSER_NAMES[browser])
    if (newWindow) args.push("-n")
  }
  args.push(url)

  const proc = Bun.spawn(args, {
    stdio: ["inherit", "inherit", "inherit"],
  })

  await proc.exited
}
