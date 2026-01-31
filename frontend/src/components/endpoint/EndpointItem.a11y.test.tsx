/**
 * Accessibility tests for EndpointItem component
 * Ensures WCAG 2.1 AA compliance
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EndpointItem } from './EndpointItem'
import type { Endpoint } from '@/lib/types'

expect.extend(toHaveNoViolations)

describe('EndpointItem Accessibility', () => {
  const mockEndpoint: Endpoint = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    created_at: '2024-01-15T10:30:00Z',
    custom_response_enabled: false,
    response_status: 200,
    response_headers: {},
    response_body: '',
    forward_url: null,
    max_requests: 100,
    rate_limit_per_minute: null,
  }

  const defaultProps = {
    endpoint: mockEndpoint,
    selected: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onConfigure: vi.fn(),
    requestCount: 5,
  }

  it('should not have accessibility violations in default state', async () => {
    const { container } = render(<EndpointItem {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations when selected', async () => {
    const { container } = render(<EndpointItem {...defaultProps} selected={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations with custom response enabled', async () => {
    const endpointWithCustomResponse = {
      ...mockEndpoint,
      custom_response_enabled: true,
    }
    const { container } = render(
      <EndpointItem {...defaultProps} endpoint={endpointWithCustomResponse} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations with zero requests', async () => {
    const { container } = render(<EndpointItem {...defaultProps} requestCount={0} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels for interactive elements', () => {
    const { getByRole, getByLabelText } = render(<EndpointItem {...defaultProps} />)

    // Main button should have proper label
    const mainButton = getByRole('button', { name: /select endpoint/i })
    expect(mainButton).toBeInTheDocument()

    // Action buttons should have proper labels
    const configureButton = getByLabelText(/configure response/i)
    expect(configureButton).toBeInTheDocument()

    const deleteButton = getByLabelText(/delete endpoint/i)
    expect(deleteButton).toBeInTheDocument()
  })

  it('should be keyboard accessible', () => {
    const { getByRole } = render(<EndpointItem {...defaultProps} />)

    const mainButton = getByRole('button', { name: /select endpoint/i })
    expect(mainButton).toHaveAttribute('tabIndex', '0')
  })

  it('should have proper role attribute', () => {
    const { getByRole } = render(<EndpointItem {...defaultProps} />)

    const mainButton = getByRole('button', { name: /select endpoint/i })
    expect(mainButton).toHaveAttribute('role', 'button')
  })

  it('should have descriptive title attributes for visual indicators', () => {
    const endpointWithCustomResponse = {
      ...mockEndpoint,
      custom_response_enabled: true,
    }
    const { container } = render(
      <EndpointItem {...defaultProps} endpoint={endpointWithCustomResponse} />
    )

    const customResponseIndicator = container.querySelector('[title="Custom response enabled"]')
    expect(customResponseIndicator).toBeInTheDocument()
  })

  it('should not have color contrast violations', async () => {
    const { container } = render(<EndpointItem {...defaultProps} />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should handle focus management properly', () => {
    const { getByRole } = render(<EndpointItem {...defaultProps} />)

    const mainButton = getByRole('button', { name: /select endpoint/i })

    // Element should be focusable
    mainButton.focus()
    expect(document.activeElement).toBe(mainButton)
  })
})
