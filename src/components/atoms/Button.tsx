import { cn } from "@/lib/utils"

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (event?: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  title?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  style,
  title
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variants = {
    default: 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-500 shadow-lg hover:shadow-xl',
    primary: 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-green-700 text-green-700 hover:bg-green-800 hover:text-white focus:ring-green-500',
    ghost: 'text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      title={title}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  );
} 