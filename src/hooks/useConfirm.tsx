'use client'

import { useState, useCallback } from 'react'
import ConfirmDialog from '@/components/molecules/ConfirmDialog'

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  loading: boolean
  onConfirm: () => void | Promise<void>
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        loading: false,
        onConfirm: async () => {
          setState(prev => prev ? { ...prev, loading: true } : null)
          try {
            resolve(true)
          } finally {
            setState(null)
          }
        }
      })

      // Handle cancel/close
      const handleCancel = () => {
        setState(null)
        resolve(false)
      }

      // Store cancel handler for cleanup
      setState(prev => prev ? { 
        ...prev, 
        onCancel: handleCancel 
      } as any : null)
    })
  }, [])

  const ConfirmDialogComponent = useCallback(() => {
    if (!state) return null

    return (
      <ConfirmDialog
        isOpen={state.isOpen}
        onClose={() => {
          setState(null)
        }}
        onConfirm={state.onConfirm}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        loading={state.loading}
        icon={state.icon}
      />
    )
  }, [state])

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent
  }
}

export default useConfirm
