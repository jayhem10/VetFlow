import { cn } from "@/lib/utils"

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors'
  
  const variants = {
    default: 'border-transparent bg-green-700 text-white shadow hover:bg-green-800',
    secondary: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
    destructive: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
    outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
  }

  const combinedClasses = cn(baseClasses, variants[variant], className)

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  )
}

export default Badge
