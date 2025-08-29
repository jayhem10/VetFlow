'use client'

import { cn } from '@/lib/utils'
import Button from './Button'
import type { ButtonProps } from './Button'
import { Edit } from 'lucide-react'

interface EditButtonProps extends Omit<ButtonProps, 'children'> {
  children?: React.ReactNode
  showText?: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EditButton({ 
  children, 
  showText = false, 
  text = "Modifier",
  size = 'sm',
  variant = 'outline',
  className,
  ...props 
}: EditButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      <Edit className="w-4 h-4" />
      {showText && <span>{text}</span>}
      {children}
    </Button>
  )
}
