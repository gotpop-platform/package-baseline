type FragmentType = string | string[] | JSX.Element | JSX.Element[]

export const Fragment = ({
  children,
}: {
  children?: FragmentType
}): FragmentType | null => {
  if (children !== undefined) {
    return children
  }
  return null
}
