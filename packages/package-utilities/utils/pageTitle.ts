import { env } from "process"

const toSentenceCase = (str: string) => {
  return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase())
}

export const title = (title = "") =>
  env.npm_package_config_app_site_name + " | " + toSentenceCase(title.trim().replace(/[-\/]/g, " "))
