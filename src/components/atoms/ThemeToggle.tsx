'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fonction pour appliquer le thème
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialisation au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setMounted(true);
    
    console.log('🎨 ThemeToggle initialisé:', shouldBeDark ? 'dark' : 'light');
  }, []);

  const handleToggle = () => {
    const newTheme = !isDark;
    console.log('🔄 Toggle thème vers:', newTheme ? 'dark' : 'light');
    
    setIsDark(newTheme);
    applyTheme(newTheme);
    
    console.log('✅ DOM classes après toggle:', document.documentElement.className);
  };

  // Affichage pendant l'hydratation
  if (!mounted) {
    return (
      <button 
        className="p-2 rounded-lg bg-gray-100 text-gray-700 text-xl w-10 h-10 flex items-center justify-center"
        disabled
      >
        🌗
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-xl border border-gray-200 dark:border-gray-600"
      aria-label={`Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`}
      type="button"
      title={`Mode actuel: ${isDark ? 'sombre' : 'clair'} - Cliquez pour basculer`}
    >
      <span className="relative">
        {isDark ? '☀️' : '🌙'}
        <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-current opacity-50"></span>
      </span>
    </button>
  );
} 