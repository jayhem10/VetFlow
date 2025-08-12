'use client'

import { cn } from '@/lib/utils'

interface ListLoaderProps {
  rows?: number
  avatar?: boolean
  className?: string
}

export function ListLoader({ rows = 5, avatar = false, className }: ListLoaderProps) {
  return (
    <ul className={cn('space-y-2', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <li key={idx} className="flex items-start gap-3 p-3 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          {avatar && (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-2/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListLoader


