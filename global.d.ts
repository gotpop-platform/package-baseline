// declare global {
//   namespace JSX {
//     interface Element {}
//     interface IntrinsicElements {
//       [elemName: string]: any
//     }
//   }
// }

// export { }

declare global {
  namespace JSX {
    interface Element {
      type?: any
      props?: any
      // [key: string]: any
    }

    interface IntrinsicElements {
      [elemName: string]: {
        id?: string
        class?: string
        className?: string
        style?: string | Record<string, string | number>
        children?: string | string[] | Element[]
        [key: string]: any
      }
    }

    interface IntrinsicAttributes {
      key?: string | number
      id?: string
      class?: string
    }
  }
}

export {}
