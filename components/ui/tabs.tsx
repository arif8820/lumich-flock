// client: tab state managed with React context
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('Tabs subcomponent used outside <Tabs>')
  return ctx
}

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internalValue

  function handleChange(v: string) {
    if (!controlled) setInternalValue(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg p-1',
        'bg-[var(--lf-bg)] border border-[var(--lf-border)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const { value: current, onValueChange } = useTabs()
  const isActive = current === value

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'px-4 py-1.5 text-sm rounded-md font-medium transition-colors',
        isActive
          ? 'bg-white text-[var(--lf-blue)] shadow-sm'
          : 'text-[var(--lf-text-mid)] hover:text-[var(--lf-text-dark)]',
        className
      )}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const { value: current } = useTabs()
  if (current !== value) return null
  return <div className={cn('mt-0', className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
