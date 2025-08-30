import Button from '@/components/atoms/Button';
import Link from 'next/link';
import { Heading1, BodyText, SmallText } from '@/components/atoms/Typography';

export default function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Heading1 className="mb-6 text-gray-900 dark:text-white">
              Révolutionnez la gestion de votre 
              <span className="text-green-700 dark:text-green-400"> clinique vétérinaire</span>
            </Heading1>
            
            <BodyText className="mb-8 text-gray-800 dark:text-gray-200">
              VetFlow simplifie la gestion quotidienne de votre cabinet vétérinaire avec une interface moderne, 
              intuitive et des fonctionnalités pensées par des professionnels pour des professionnels.
            </BodyText>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  🚀 Commencer gratuitement
                </Button>
              </Link>
            </div>
            
            <SmallText className="text-gray-700 dark:text-gray-300">
              ✅ Essai gratuit de 14 jours • ✅ Aucune carte bancaire requise • ✅ Support 24/7
            </SmallText>
          </div>
          
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform border border-stone-200 dark:border-gray-700">
              {/* Barre de titre de l'application */}
              <div className="flex items-center justify-between bg-gradient-to-r from-green-700 to-green-700 h-8 rounded-t-lg mb-6 px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-white text-sm font-medium">VetFlow Dashboard</span>
                <div className="w-6"></div>
              </div>

              {/* Contenu de la card */}
              <div className="space-y-5">
                {/* Aujourd'hui: mêmes cartes que le dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Aujourd'hui</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">RDV du jour</div>
                      <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">8</div>
                    </div>
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
                      <div className="text-sm text-blue-700 dark:text-blue-300">CA du jour</div>
                      <div className="text-xl font-bold text-blue-800 dark:text-blue-200">1 240€</div>
                    </div>
                    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
                      <div className="text-sm text-green-700 dark:text-green-300">Factures payées</div>
                      <div className="text-xl font-bold text-green-800 dark:text-green-200">5</div>
                    </div>
                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                      <div className="text-sm text-amber-700 dark:text-amber-300">En attente</div>
                      <div className="text-xl font-bold text-amber-800 dark:text-amber-200">3</div>
                    </div>
                  </div>
                </div>

                {/* Liste de RDV à venir */}
                <div className="bg-stone-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Prochains RDV</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">15:00 - Luna (Chat) • Contrôle</span>
                      <span className="text-orange-700 dark:text-orange-300 font-medium">M. Martin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">15:30 - Rex (Chien) • Urgence</span>
                      <span className="text-red-700 dark:text-red-300 font-medium">Mme. Petit</span>
                    </div>
                  </div>
                </div>

                {/* Aperçu de la clinique (mêmes cartes que le dashboard) */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Aperçu de la clinique</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">254</div>
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Propriétaires</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">412</div>
                      <div className="text-xs font-medium text-green-700 dark:text-green-300">Animaux</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">39</div>
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-300">RDV ce mois</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">7</div>
                      <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Collaborateurs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 