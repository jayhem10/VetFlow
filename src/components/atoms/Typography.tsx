interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function Heading1({ children, className = '' }: TypographyProps) {
  return (
    <h1 className={`text-5xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className = '' }: TypographyProps) {
  return (
    <h2 className={`text-4xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className = '' }: TypographyProps) {
  return (
    <h3 className={`text-2xl font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function BodyText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-xl text-gray-600 dark:text-gray-300 ${className}`}>
      {children}
    </p>
  );
}

export function SmallText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
} 