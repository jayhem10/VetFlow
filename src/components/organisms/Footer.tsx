export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-green-700 dark:text-green-400">Flow</span>
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 mb-4 max-w-md">
              La solution complète pour la gestion moderne de votre clinique vétérinaire. 
              Simplifie votre quotidien, améliore les soins.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Fonctionnalités</a></li>
              <li><a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Tarifs</a></li>
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Sécurité</a></li>
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Intégrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Formation</a></li>
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">API Documentation</a></li>
              <li><a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">Nous contacter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-300 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              © 2025 VetFlow. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 