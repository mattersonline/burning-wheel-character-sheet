import { type ReactNode, useLayoutEffect, useRef } from 'react'

const GridRow = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLTableRowElement>(null)

  useLayoutEffect(() => {
    const row = ref.current
    if (!row) return
    const resize = () => {
      const fields = row.querySelectorAll('textarea')
      let height = 52
      for (const field of fields) {
        field.style.height = '0px'
        height = Math.max(height, field.scrollHeight)
        field.style.removeProperty('height')
      }
      row.style.setProperty('--row-height', `${height}px`)
    }
    resize()
    let width = row.getBoundingClientRect().width
    const observer = new ResizeObserver(() => {
      const nextWidth = row.getBoundingClientRect().width
      if (nextWidth !== width) {
        width = nextWidth
        resize()
      }
    })
    observer.observe(row)
    return () => observer.disconnect()
  })

  return <tr ref={ref}>{children}</tr>
}

export default GridRow
