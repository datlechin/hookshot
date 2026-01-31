/**
 * Tests for CopyButton component
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  let clipboardWriteTextSpy: MockInstance

  beforeEach(() => {
    // Create a mock clipboard if it doesn't exist
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn(),
        },
        writable: true,
        configurable: true,
      })
    }

    // Spy on the writeText method
    clipboardWriteTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
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

    // Verify initial state
    expect(button).toHaveTextContent('Copy')

    await user.click(button)

    // Verify the UI updates to show "Copied!" which confirms the copy function was called
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('shows "Copied!" feedback after successful copy', async () => {
    const user = userEvent.setup()

    render(<CopyButton text="test content" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Copied!')
    })
  })

  it('reverts to original label after 2 seconds', async () => {
    vi.useFakeTimers()

    render(<CopyButton text="test content" label="Copy Text" />)

    const button = screen.getByRole('button')

    // Click the button using fireEvent to avoid timer conflicts with userEvent
    await act(async () => {
      button.click()
    })

    // Should show "Copied!"
    expect(screen.getByRole('button')).toHaveTextContent('Copied!')

    // Fast-forward time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Should revert to original label
    expect(screen.getByRole('button')).toHaveTextContent('Copy Text')

    vi.useRealTimers()
  })

  it('handles copy errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    // Mock clipboard to reject
    clipboardWriteTextSpy.mockRejectedValueOnce(new Error('Clipboard access denied'))

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

    const svgIcon = container.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
  })

  it('shows Check icon after copying', async () => {
    const user = userEvent.setup()

    render(<CopyButton text="test content" />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Copied!')
      const svgIcon = screen.getByRole('button').querySelector('svg')
      expect(svgIcon).toBeInTheDocument()
    })
  })
})
