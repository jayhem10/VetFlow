import Button from '@/components/atoms/Button';
import ThemeToggle from '@/components/atoms/ThemeToggle';

export default function Header() {

  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900 shadow-sm border-b border-stone-200 dark:border-gray-700 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
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
                Vet<span className="text-blue-700 dark:text-blue-400">Flow</span>
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-400 -mt-1">Gestion Vétérinaire</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Tarifs
            </a>
            <a href="#testimonials" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Témoignages
            </a>
            <a href="#contact" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Contact
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <a href="/login">
              <Button variant="ghost">
                Se connecter
              </Button>
            </a>
            <a href="/register">
              <Button variant="primary">
                S'inscrire gratuitement
              </Button>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
} 