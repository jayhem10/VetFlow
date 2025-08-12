'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label?: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  separator?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  showActiveIndicator?: boolean;
}

export function Dropdown({ 
  trigger, 
  items, 
  align = 'right', 
  className,
  showActiveIndicator = false 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    if (item.onClick) item.onClick();
    if (item.href) window.location.href = item.href;
    setIsOpen(false);
  };

  const isItemActive = (item: DropdownItem) => {
    if (!showActiveIndicator || !item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center transition-all duration-200',
          isOpen && 'text-green-700 dark:text-green-400'
        )}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={cn(
          'absolute top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50',
          'backdrop-blur-sm bg-white/95 dark:bg-gray-800/95',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          <div className="py-1">
            {items.map((item, index) => (
              <div key={index}>
                {item.separator ? (
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center gap-3 relative',
                      item.disabled 
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : isItemActive(item)
                        ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-400'
                    )}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span>{item.label}</span>
                    {isItemActive(item) && (
                      <div className="absolute right-3 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}