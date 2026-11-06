import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GridRow from '@/components/RecordGrid/GridRow'

const sizing = vi.hoisted(() => ({
  heights: [52, 52],
  width: 700,
  setProperty: vi.fn(),
  callback: () => {},
  cleanup: undefined as (() => void) | undefined,
  disconnect: vi.fn(),
}))

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useRef: () => ({
    current: {
      querySelectorAll: () =>
        sizing.heights.map((scrollHeight) => ({
          scrollHeight,
          style: { height: '', removeProperty: vi.fn() },
        })),
      style: { setProperty: sizing.setProperty },
      getBoundingClientRect: () => ({ width: sizing.width }),
    },
  }),
  useLayoutEffect: (effect: () => (() => void) | undefined) => {
    sizing.cleanup?.()
    sizing.cleanup = effect()
  },
}))

describe('grid row sizing', () => {
  beforeEach(() => {
    sizing.heights = [52, 52]
    sizing.width = 700
    sizing.setProperty.mockClear()
    sizing.disconnect.mockClear()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          sizing.callback = callback
        }
        observe() {}
        disconnect() {
          sizing.disconnect()
        }
      },
    )
  })

  afterEach(() => {
    sizing.cleanup?.()
    sizing.cleanup = undefined
    vi.unstubAllGlobals()
  })

  it('grows the entire row to fit the tallest text cell', () => {
    sizing.heights = [52, 136]
    GridRow({ children: null })
    expect(sizing.setProperty).toHaveBeenLastCalledWith('--row-height', '136px')
  })

  it('shrinks back to the tablet minimum when text is shortened', () => {
    sizing.heights = [136, 80]
    GridRow({ children: null })
    sizing.heights = [20, 20]
    GridRow({ children: null })
    expect(sizing.setProperty).toHaveBeenLastCalledWith('--row-height', '52px')
  })

  it('remeasures width changes without looping on its own height changes', () => {
    GridRow({ children: null })
    sizing.setProperty.mockClear()
    sizing.callback()
    expect(sizing.setProperty).not.toHaveBeenCalled()
    sizing.width = 400
    sizing.heights = [80, 108]
    sizing.callback()
    expect(sizing.setProperty).toHaveBeenCalledExactlyOnceWith('--row-height', '108px')
  })
})
