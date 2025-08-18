'use client'

import { useState, useCallback, useRef } from 'react'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  loading: boolean
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({
        ...options,
        isOpen: true,
        loading: false
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef.current && state?.isOpen) {
      // Fermer immédiatement la modal et résoudre la promesse
      resolveRef.current(true)
      resolveRef.current = null
      setState(null)
    }
  }, [state?.isOpen])

  const handleCancel = useCallback(() => {
    if (resolveRef.current && state?.isOpen) {
      resolveRef.current(false)
      resolveRef.current = null
      setState(null)
    }
  }, [state?.isOpen])

  const ConfirmDialogComponent = useCallback(() => {
    if (!state) return null

    return (
      <ConfirmDialog
        isOpen={state.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        loading={state.loading}
      />
    )
  }, [state, handleConfirm, handleCancel])

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent
  }
}

export default useConfirm
