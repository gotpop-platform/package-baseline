import { jsxFactory, Fragment } from "@gotpop-platform/package-baseline"

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
  interface Element extends ReturnType<typeof jsxFactory> {}
  interface ElementClass {
    render: any
  }
  interface ElementAttributesProperty {
    props: any
  }
  interface ElementChildrenAttribute {
    children: any
  }
  interface IntrinsicAttributes {
    key?: string | number
  }
  interface IntrinsicClassAttributes<T> {
    ref?: T
  }
}

declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}
