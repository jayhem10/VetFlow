'use client'

import { useState } from 'react';
import Button from '@/components/atoms/Button';
import ThemeToggle from '@/components/atoms/ThemeToggle';
import { GlobalSearch } from '@/components/molecules/GlobalSearch';
import { Dropdown } from '@/components/atoms/Dropdown';
import { NavLink } from '@/components/atoms/NavLink';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { TemporaryPasswordBanner } from '@/components/molecules/TemporaryPasswordBanner';

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleShortcutClick = (path: string) => {
    setShowShortcutsModal(false);
    router.push(path);
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      label: 'Animaux',
      href: '/animals',
      icon: '🐾'
    },
    {
      label: 'Propriétaires',
      href: '/owners',
      icon: '👥'
    },
    {
      label: 'Rendez-vous',
      href: '/appointments',
      icon: '📅'
    },
    {
      label: 'Équipe',
      href: '/collaborators',
      icon: '🤝'
    }
  ];

  const userMenuItems = [
    {
      label: 'Mon profil',
      href: '/profile',
      icon: '👤'
    },
    {
      label: 'Paramètres',
      href: '/settings',
      icon: '⚙️'
    },
    {
      separator: true
    },
    {
      label: 'Déconnexion',
      onClick: handleSignOut,
      icon: '🔓'
    }
  ];

  const shortcutsItems = [
    {
      label: 'Ajouter un animal',
      icon: '➕',
      onClick: () => handleShortcutClick('/animals'),
      description: 'Créer un nouveau dossier animal'
    },
    {
      label: 'Nouveau propriétaire',
      icon: '👤',
      onClick: () => handleShortcutClick('/owners'),
      description: 'Enregistrer un nouveau propriétaire'
    },
    {
      label: 'Nouveau rendez-vous',
      icon: '📅',
      onClick: () => handleShortcutClick('/appointments'),
      description: 'Planifier une consultation'
    },
    {
      label: 'Inviter collaborateur',
      icon: '🤝',
      onClick: () => handleShortcutClick('/collaborators'),
      description: 'Ajouter un membre à l\'équipe'
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900 shadow-sm border-b border-stone-200 dark:border-gray-700 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a 
              href={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                  >
                    <path d="M11 2v20h2V2h-2zm-9 9v2h20v-2H2z" opacity="0.8"/>
                    <circle cx="6" cy="6" r="1.5" opacity="0.9"/>
                    <circle cx="8" cy="4" r="1" opacity="0.7"/>
                    <circle cx="4" cy="4" r="1" opacity="0.7"/>
                    <ellipse cx="6" cy="8.5" rx="1" ry="1.5" opacity="0.6"/>
                    <path d="M18 7c0-1.1-.9-2-2-2s-2 .9-2 2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V7z" opacity="0.8"/>
                    <path d="M18 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity="0.9"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Vet<span className="text-green-700 dark:text-green-400">Flow</span>
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-400 -mt-1">
                  {isAuthenticated ? 'Dashboard' : 'Gestion Vétérinaire'}
                </span>
              </div>
            </a>
            
            {/* Navigation Desktop - Seulement pour utilisateurs non connectés */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-8">
                <NavLink href="#features">
                  Fonctionnalités
                </NavLink>
                <NavLink href="#pricing">
                  Tarifs
                </NavLink>
                <NavLink href="#testimonials">
                  Témoignages
                </NavLink>
                <NavLink href="#contact">
                  Contact
                </NavLink>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="hidden md:block">
                  <GlobalSearch />
                </div>
              )}
              <ThemeToggle />
              
              {isAuthenticated ? (
                // Utilisateur connecté - Menu déroulant avec navigation
                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                        {user?.name || user?.email || 'Utilisateur'}
                      </span>
                      <svg 
                        className="w-4 h-4 text-gray-500 dark:text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  }
                  items={[
                    ...navigationItems,
                    { separator: true },
                    {
                      label: 'Raccourcis',
                      onClick: () => setShowShortcutsModal(true),
                      icon: '⚡'
                    },
                    { separator: true },
                    ...userMenuItems
                  ]}
                  showActiveIndicator={true}
                />
              ) : (
                // Utilisateur non connecté
                <>
                  <NavLink href="/login" variant="ghost">
                    Se connecter
                  </NavLink>
                  <NavLink href="/register" variant="button">
                    S'inscrire gratuitement
                  </NavLink>
                </>
              )}

             
            </div>
          </div>

          {/* Menu mobile */}
          {isAuthenticated && isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="px-1 py-2">
                  <GlobalSearch />
                </div>
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={() => {
                    setShowShortcutsModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ⚡ Raccourcis
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <a
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  👤 Mon profil
                </a>
                <a
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ⚙️ Paramètres
                </a>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  🔓 Déconnexion
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modal Raccourcis */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">⚡</span>
                Raccourcis rapides
              </h2>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {shortcutsItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full group flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-700"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 text-lg mr-4">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 