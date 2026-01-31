/**
 * Tabs component for tabbed interface
 */

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component')
  }
  return context
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center space-x-4 px-4 py-2 border-b border-(--border) bg-(--background) ${className}`}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext()
  const isActive = selectedValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? 'text-(--accent-blue) border-b-2 border-(--accent-blue)'
          : 'text-(--text-secondary) hover:text-(--text-primary)'
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext()

  if (selectedValue !== value) {
    return null
  }

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}
