import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'text' | 'button' | 'ghost';
  className?: string;
  onClick?: () => void;
}

export function NavLink({ 
  href, 
  children, 
  variant = 'text', 
  className,
  onClick 
}: NavLinkProps) {
  const baseClasses = "cursor-pointer transition-all duration-200";
  
  const variantClasses = {
    text: "text-gray-800 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium",
    button: "inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-700 text-white hover:bg-green-800 font-medium",
    ghost: "inline-flex items-center justify-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
  };

  return (
    <Link 
      href={href}
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 