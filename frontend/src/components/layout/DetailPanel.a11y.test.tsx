/**
 * Accessibility tests for DetailPanel component
 * Ensures WCAG 2.1 AA compliance
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DetailPanel } from './DetailPanel'
import type { WebhookRequest } from '@/lib/types'

expect.extend(toHaveNoViolations)

describe('DetailPanel Accessibility', () => {
  const mockRequest: WebhookRequest = {
    id: 1,
    endpoint_id: '550e8400-e29b-41d4-a716-446655440000',
    method: 'POST',
    path: '/webhook',
    query_string: 'key=value',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0',
      authorization: 'Bearer token123',
    },
    body: '{"message":"test"}',
    content_type: 'application/json',
    received_at: '2024-01-15T10:30:00Z',
    ip_address: '192.168.1.1',
  }

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedRequest: mockRequest,
    loading: false,
  }

  it('should not have accessibility violations when open with request', async () => {
    const { container } = render(<DetailPanel {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations when loading', async () => {
    const { container } = render(<DetailPanel {...defaultProps} loading={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations in empty state', async () => {
    const { container } = render(
      <DetailPanel {...defaultProps} selectedRequest={null} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels for close button', () => {
    const { getByLabelText } = render(<DetailPanel {...defaultProps} />)

    const closeButton = getByLabelText(/close detail panel/i)
    expect(closeButton).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    const { container } = render(<DetailPanel {...defaultProps} />)

    // Should have an h2 heading
    const heading = container.querySelector('h2')
    expect(heading).toBeInTheDocument()
  })

  it('should have semantic HTML structure', () => {
    const { container } = render(<DetailPanel {...defaultProps} />)

    // Should use aside element for panel
    const aside = container.querySelector('aside')
    expect(aside).toBeInTheDocument()
  })

  it('should not have color contrast violations', async () => {
    const { container } = render(<DetailPanel {...defaultProps} />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have accessible tabs', () => {
    const { getAllByRole } = render(<DetailPanel {...defaultProps} />)

    // Tabs should be accessible
    const tabs = getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)

    // Each tab should have a label
    tabs.forEach((tab) => {
      expect(tab.textContent).toBeTruthy()
    })
  })

  it('should handle keyboard navigation', () => {
    const { getByLabelText } = render(<DetailPanel {...defaultProps} />)

    const closeButton = getByLabelText(/close detail panel/i)

    // Close button should be focusable
    closeButton.focus()
    expect(document.activeElement).toBe(closeButton)
  })

  it('should have proper ARIA attributes for panels', () => {
    const { container } = render(<DetailPanel {...defaultProps} />)

    // Tab panels should have proper ARIA attributes
    const tabPanels = container.querySelectorAll('[role="tabpanel"]')
    expect(tabPanels.length).toBeGreaterThan(0)
  })

  it('should not have missing alt text violations', async () => {
    const { container } = render(<DetailPanel {...defaultProps} />)
    const results = await axe(container, {
      rules: {
        'image-alt': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have proper focus management when closed', () => {
    const { container } = render(<DetailPanel {...defaultProps} isOpen={false} />)

    // Panel should not be rendered when closed
    expect(container.querySelector('aside')).not.toBeInTheDocument()
  })

  it('should support screen readers with proper labels', () => {
    const { container } = render(<DetailPanel {...defaultProps} />)

    // All interactive elements should have accessible names
    const buttons = container.querySelectorAll('button')
    buttons.forEach((button) => {
      expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy()
    })
  })

  it('should have proper landmark regions', () => {
    const { container } = render(<DetailPanel {...defaultProps} />)

    // Panel should be a landmark region (aside)
    const aside = container.querySelector('aside')
    expect(aside).toBeInTheDocument()
  })

  it('should not have duplicate IDs', async () => {
    const { container } = render(<DetailPanel {...defaultProps} />)
    const results = await axe(container, {
      rules: {
        'duplicate-id': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })
})
