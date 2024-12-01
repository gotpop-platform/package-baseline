export async function timeFunction<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const { env } = process
  const isDevelopment = env.NODE_ENV === "development"

  if (isDevelopment) console.time(label)
  try {
    const result = await fn()
    if (isDevelopment) console.timeEnd(label)
    return result
  } catch (error) {
    if (isDevelopment) console.timeEnd(label)
    throw error
  }
}
