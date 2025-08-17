// Fix: apps/admin/components/ui/dialog.tsx
// Replace your dialog component with this fixed version:

'use client'

import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onOpenChange])

  return (
    <>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => onOpenChange(false)}
          />
          {/* Content will be rendered here by DialogContent */}
        </div>
      )}
    </>
  )
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  return <>{children}</>
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  return (
    <div className={`relative bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-auto z-[10000] ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  )
}