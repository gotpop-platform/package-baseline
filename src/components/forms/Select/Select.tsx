import { jsxFactory } from "../../../package-jsx-factory"
import { useCSS } from "../../../package-utilities"

type SelectListProps = {
  SelectListName?: string
}

export const useName = import.meta.file.split(".").shift()?.toLowerCase()

const Select = () => {
  const { css } = useCSS({ meta: import.meta })

  return (
    <selectlist className={useName} id="browser-filter">
      <button type="selectlist">
        <selectedoption></selectedoption>
      </button>
      <option value="edge" checked="">
        Edge
      </option>
      <option value="chrome">Chrome</option>
      <option value="firefox">Firefox</option>
      <option value="brave">Brave</option>
      <option value="safari">Safari</option>
      <option value="opera">Opera</option>
    </selectlist>
  )
}

export default Select
