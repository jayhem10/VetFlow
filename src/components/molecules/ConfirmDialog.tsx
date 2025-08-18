'use client';

import { Dialog } from '@/components/atoms/Dialog';
import Button from '@/components/atoms/Button';
import { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onError?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  onError,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (isConfirming) return; // Éviter les clics multiples
    
    setIsConfirming(true);
    try {
      await onConfirm();
    } catch (error) {
      // En cas d'erreur, fermer le modal et réinitialiser l'état
      setIsConfirming(false);
      onError?.();
    }
  };

  const handleClose = () => {
    if (isConfirming) return; // Empêcher la fermeture pendant la confirmation
    
    setIsConfirming(false);
    onClose();
  };

  // Reset l'état quand la modal se ferme
  const handleDialogClose = () => {
    setIsConfirming(false);
    onClose();
  };

  // Reset l'état quand la modal s'ouvre/se ferme
  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const styles = getVariantStyles();
  const isDisabled = loading || isConfirming;

  return (
    <Dialog isOpen={isOpen} onClose={handleDialogClose}>
      <div className="p-6 w-full max-w-md">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className={`text-2xl ${styles.iconColor}`}>{styles.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDisabled}
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isDisabled}
            loading={isDisabled}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
