export async function timeFunction<T>(
  label: string,
  fn: () => Promise<T>,
  isDevelopment: boolean
): Promise<T> {
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
