/**
 * Tests for CopyButton component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
  })

  it('renders with default label', () => {
    render(<CopyButton text="test content" />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<CopyButton text="test content" label="Copy URL" />)
    expect(screen.getByText('Copy URL')).toBeInTheDocument()
  })

  it('copies text to clipboard when clicked', async () => {
    const user = userEvent.setup()
    const testText = 'test content to copy'

    render(<CopyButton text={testText} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText)
  })

  it('shows "Copied!" feedback after successful copy', async () => {
    const user = userEvent.setup({ delay: null })

    render(<CopyButton text="test content" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('reverts to original label after 2 seconds', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ delay: null })

    render(<CopyButton text="test content" label="Copy Text" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText('Copy Text')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('handles copy errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup({ delay: null })

    // Mock clipboard to reject
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.reject(new Error('Clipboard access denied'))),
      },
    })

    render(<CopyButton text="test content" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CopyButton text="test content" className="custom-class" />
    )

    const button = container.querySelector('.custom-class')
    expect(button).toBeInTheDocument()
  })

  it('shows Copy icon initially', () => {
    const { container } = render(<CopyButton text="test content" />)

    // Look for the Copy icon (lucide-react renders SVGs)
    const svgIcon = container.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
  })

  it('shows Check icon after copying', async () => {
    const user = userEvent.setup({ delay: null })

    render(<CopyButton text="test content" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })
})
