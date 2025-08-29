'use client'

import { useState } from 'react';
import Button from '@/components/atoms/Button';
import ThemeToggle from '@/components/atoms/ThemeToggle';
import { GlobalSearch } from '@/components/molecules/GlobalSearch';
import { Dropdown } from '@/components/atoms/Dropdown';
import { NavLink } from '@/components/atoms/NavLink';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { TemporaryPasswordBanner } from '@/components/molecules/TemporaryPasswordBanner';
import { X, User, Settings, LogOut, Zap, LayoutDashboard, PawPrint, Users, Calendar, FileText, Briefcase, Boxes, User as UserIcon, Plus } from 'lucide-react';
import LogoIcon from '@/components/atoms/LogoIcon'

// Header pour les utilisateurs authentifiés avec menus selon les permissions
export default function AuthenticatedHeader() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { menuItems, shortcutItems } = usePermissions();
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

  // Mapping icônes menu/shortcuts (depuis lib/permissions.ts)
  const iconMap: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard className="w-4 h-4" />,
    animals: <PawPrint className="w-4 h-4" />,
    owners: <UserIcon className="w-4 h-4" />,
    appointments: <Calendar className="w-4 h-4" />,
    invoices: <FileText className="w-4 h-4" />,
    collaborators: <Users className="w-4 h-4" />,
    services: <Briefcase className="w-4 h-4" />,
    stock: <Boxes className="w-4 h-4" />,
    add: <Plus className="w-4 h-4" />,
    owner: <UserIcon className="w-4 h-4" />,
    appointment: <Calendar className="w-4 h-4" />,
  }

  const userMenuItems = [
    {
      label: 'Mon profil',
      href: '/profile',
      icon: <User className="w-4 h-4" />
    },
    {
      label: 'Paramètres de la clinique',
      href: '/clinic-settings',
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: 'Paramètres',
      href: '/settings',
      icon: <Settings className="w-4 h-4" />
    },
    {
      separator: true
    },
    {
      label: 'Déconnexion',
      onClick: handleSignOut,
      icon: <LogOut className="w-4 h-4" />
    }
  ];

  return (
    <>
      <TemporaryPasswordBanner />
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900 shadow-sm border-b border-stone-200 dark:border-gray-700 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a 
              href={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg text-emerald-600">
                  <LogoIcon size={40} />
                </div>
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
                    ...menuItems.map((item:any) => ({
                      ...item,
                      icon: item.icon && iconMap[item.icon] ? iconMap[item.icon] : item.icon
                    })),
                    { separator: true },
                    {
                      label: 'Raccourcis',
                      onClick: () => setShowShortcutsModal(true),
                      icon: <Zap className="w-4 h-4" />
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
                {menuItems.map((item:any) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="mr-2 inline-flex items-center">{iconMap[item.icon] || item.icon}</span>
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
                  <Zap className="w-4 h-4" /> Raccourcis
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <a
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4" /> Mon profil
                </a>
                <a
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Paramètres
                </a>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
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
                <Zap className="w-5 h-5 mr-2" />
                Raccourcis rapides
              </h2>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {shortcutItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleShortcutClick(item.href)}
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