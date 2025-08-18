'use client';

import { useState } from 'react';
import Button from '@/components/atoms/Button';

interface DebugErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  title?: string;
}

export function DebugErrorModal({ isOpen, onClose, error, title = "Erreur détaillée" }: DebugErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap break-words">
              {error}
            </pre>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
