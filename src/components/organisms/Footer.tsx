import LogoIcon from '@/components/atoms/LogoIcon'

export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4 text-emerald-600">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <LogoIcon size={28} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-green-700 dark:text-green-400">Flow</span>
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 mb-4 max-w-md">
              Planning, dossiers patients, facturation et inventaire — dans une interface moderne.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Fonctionnalités</a></li>
              <li><a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Tarifs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Légal
            </h4>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Confidentialité</a></li>
              <li><a href="/terms" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Conditions</a></li>
              <li><a href="/legal" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-300 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              © 2025 VetFlow. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-700 dark:text-gray-300">
              <a href="/privacy" className="hover:text-green-700 dark:hover:text-green-400">Confidentialité</a>
              <a href="/terms" className="hover:text-green-700 dark:hover:text-green-400">Conditions</a>
              <a href="/legal" className="hover:text-green-700 dark:hover:text-green-400">Mentions légales</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 