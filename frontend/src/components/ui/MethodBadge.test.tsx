/**
 * Tests for MethodBadge component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MethodBadge } from './MethodBadge'

describe('MethodBadge', () => {
  it('renders HTTP method in uppercase', () => {
    render(<MethodBadge method="get" />)
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('applies correct styles for GET method', () => {
    render(<MethodBadge method="GET" />)
    const badge = screen.getByText('GET')
    expect(badge).toHaveClass('bg-[var(--accent-blue)]/10')
    expect(badge).toHaveClass('text-[var(--accent-blue)]')
  })

  it('applies correct styles for POST method', () => {
    render(<MethodBadge method="POST" />)
    const badge = screen.getByText('POST')
    expect(badge).toHaveClass('bg-[var(--accent-green)]/10')
    expect(badge).toHaveClass('text-[var(--accent-green)]')
  })

  it('applies correct styles for PUT method', () => {
    render(<MethodBadge method="PUT" />)
    const badge = screen.getByText('PUT')
    expect(badge).toHaveClass('bg-[var(--accent-orange)]/10')
    expect(badge).toHaveClass('text-[var(--accent-orange)]')
  })

  it('applies correct styles for PATCH method', () => {
    render(<MethodBadge method="PATCH" />)
    const badge = screen.getByText('PATCH')
    expect(badge).toHaveClass('bg-[var(--accent-purple)]/10')
    expect(badge).toHaveClass('text-[var(--accent-purple)]')
  })

  it('applies correct styles for DELETE method', () => {
    render(<MethodBadge method="DELETE" />)
    const badge = screen.getByText('DELETE')
    expect(badge).toHaveClass('bg-[var(--accent-red)]/10')
    expect(badge).toHaveClass('text-[var(--accent-red)]')
  })

  it('applies correct styles for HEAD method', () => {
    render(<MethodBadge method="HEAD" />)
    const badge = screen.getByText('HEAD')
    expect(badge).toHaveClass('bg-[var(--accent-yellow)]/10')
    expect(badge).toHaveClass('text-[var(--accent-yellow)]')
  })

  it('applies correct styles for OPTIONS method', () => {
    render(<MethodBadge method="OPTIONS" />)
    const badge = screen.getByText('OPTIONS')
    expect(badge).toHaveClass('bg-[var(--accent-yellow)]/10')
    expect(badge).toHaveClass('text-[var(--accent-yellow)]')
  })

  it('handles unknown methods with default styles', () => {
    render(<MethodBadge method="CUSTOM" />)
    const badge = screen.getByText('CUSTOM')
    expect(badge).toHaveClass('bg-[var(--text-secondary)]/10')
    expect(badge).toHaveClass('text-[var(--text-secondary)]')
  })

  it('handles lowercase method names', () => {
    render(<MethodBadge method="post" />)
    expect(screen.getByText('POST')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<MethodBadge method="GET" className="custom-class" />)
    const badge = screen.getByText('GET')
    expect(badge).toHaveClass('custom-class')
  })

  it('maintains base styles with custom className', () => {
    render(<MethodBadge method="GET" className="extra-padding" />)
    const badge = screen.getByText('GET')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('extra-padding')
  })
})
