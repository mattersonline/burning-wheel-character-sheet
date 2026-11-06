import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InlineRemoveButton from '@/components/RecordGrid/InlineRemoveButton'

const hooks = vi.hoisted(() => ({
  armed: false,
  button: {},
  cleanup: undefined as (() => void) | undefined,
}))

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: () => [
    hooks.armed,
    (value: boolean) => {
      hooks.armed = value
    },
  ],
  useRef: () => ({ current: hooks.button }),
  useEffect: (effect: () => (() => void) | undefined) => {
    hooks.cleanup?.()
    hooks.cleanup = effect()
  },
}))

describe('inline deletion confirmation', () => {
  const onConfirm = vi.fn()
  const render = () => InlineRemoveButton({ name: 'Rope', rowNumber: 1, onConfirm })

  beforeEach(() => {
    hooks.armed = false
    onConfirm.mockClear()
    vi.stubGlobal('document', new EventTarget())
    vi.stubGlobal('window', new EventTarget())
  })

  afterEach(() => {
    hooks.cleanup?.()
    hooks.cleanup = undefined
    vi.unstubAllGlobals()
  })

  it('requires a second tap and changes the visible label to Confirm', () => {
    render().props.onClick()
    expect(onConfirm).not.toHaveBeenCalled()
    const confirming = render()
    expect(confirming.props.children).toBe('Confirm')
    expect(confirming.props['aria-label']).toBe('Confirm removal of Rope, row 1')
    confirming.props.onClick()
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith()
    expect(hooks.armed).toBe(false)
  })

  it.each(['pointerdown', 'focusin', 'keydown', 'scroll'])(
    'clears on another %s interaction',
    (type) => {
      render().props.onClick()
      render()
      document.dispatchEvent(new Event(type))
      expect(hooks.armed).toBe(false)
      expect(onConfirm).not.toHaveBeenCalled()
      expect(render().props.children).toBe('Remove')
    },
  )

  it('clears when focus leaves the button or the window', () => {
    render().props.onClick()
    render().props.onBlur()
    expect(hooks.armed).toBe(false)
    render().props.onClick()
    render()
    window.dispatchEvent(new Event('blur'))
    expect(hooks.armed).toBe(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not clear on the confirming pointer press itself', () => {
    render().props.onClick()
    const confirming = render()
    const event = new Event('pointerdown')
    Object.defineProperty(event, 'target', { value: hooks.button })
    document.dispatchEvent(event)
    expect(hooks.armed).toBe(true)
    confirming.props.onClick()
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
