'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fonction pour appliquer le thème
  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // console.log('🌙 Mode sombre appliqué, classes:', root.className);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      // console.log('☀️ Mode clair appliqué, classes:', root.className || '(aucune classe - normal en mode light)');
    }
    
    // Forcer un reflow pour s'assurer que les changements sont appliqués
    root.offsetHeight;
  };

  // Initialisation au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentlyDark = document.documentElement.classList.contains('dark');
    
    let shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    // Vérifier la cohérence avec l'état actuel du DOM
    if (savedTheme && ((savedTheme === 'dark') !== currentlyDark)) {
      // console.log('🔧 Synchronisation nécessaire - localStorage:', savedTheme, 'DOM:', currentlyDark ? 'dark' : 'light');
      shouldBeDark = savedTheme === 'dark';
    }
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setMounted(true);
    
    // console.log('🎨 ThemeToggle initialisé:', shouldBeDark ? 'dark' : 'light', 'localStorage:', savedTheme, 'prefersDark:', prefersDark);
  }, []);

  // Écouter les changements de thème externes (autres onglets, autres composants)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newIsDark = e.newValue === 'dark';
        console.log('📡 Changement externe de thème détecté:', e.newValue);
        setIsDark(newIsDark);
        applyTheme(newIsDark);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggle = () => {
    const newTheme = !isDark;
    console.log('🔄 Toggle thème:', isDark ? 'dark → light' : 'light → dark');
    
    setIsDark(newTheme);
    applyTheme(newTheme);
    
    // Vérification après un délai pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
      const hasClass = document.documentElement.classList.contains('dark');
      console.log('✅ Vérification finale - Mode:', newTheme ? 'dark' : 'light', 'Classe dark présente:', hasClass);
      
      // Vérification de cohérence
      if ((newTheme && !hasClass) || (!newTheme && hasClass)) {
        console.warn('⚠️ Incohérence détectée, correction en cours...');
        applyTheme(newTheme);
      }
    }, 10);
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
    <div className="flex items-center gap-2">      
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-xl border border-gray-200 dark:border-gray-600"
        aria-label={`Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`}
        type="button"
        title={`Mode actuel: ${isDark ? 'sombre' : 'clair'} - Cliquez pour basculer`}
      >
        <span className="relative">
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
      

    </div>
  );
} 