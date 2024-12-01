export function styleNames(styles: Record<string, string | number>) {
  if (!styles || Object.keys(styles).length === 0) {
    return ""
  }

  return Object.entries(styles)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
      return `${kebabKey}: ${value};`
    })
    .join(" ")
}

export function styleVars(styles: Record<string, string | number>) {
  if (!styles || Object.keys(styles).length === 0) {
    return ""
  }

  return Object.entries(styles)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
      return `${kebabKey}: ${value};\n`
    })
    .join(" ")
}

export const style = styleNames
