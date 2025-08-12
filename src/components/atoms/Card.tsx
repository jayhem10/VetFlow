interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'featured' | 'pricing';
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  hover = true
}: CardProps) {
  const baseClasses = 'rounded-xl p-6 transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    featured: 'bg-gradient-to-br from-green-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-green-900',
    pricing: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
} 