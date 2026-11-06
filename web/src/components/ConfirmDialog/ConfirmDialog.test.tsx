import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'

describe('deletion dialog', () => {
  it('labels the dialog with its title and description and keeps both actions', () => {
    const markup = renderToStaticMarkup(
      <ConfirmDialog
        title="Delete character?"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(markup).toMatch(/aria-labelledby="([^"]+)" aria-describedby="([^"]+)"/)
    expect(markup).toContain('Confirm removal')
    expect(markup).toContain('Delete character?')
    expect(markup).toContain('This cannot be undone.')
    expect(markup).toContain('>Cancel</button>')
    expect(markup).toContain('>Delete</button>')
  })
})
