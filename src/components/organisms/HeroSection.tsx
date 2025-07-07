import Button from '@/components/atoms/Button';
import { Heading1, BodyText, SmallText } from '@/components/atoms/Typography';

export default function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Heading1 className="mb-6 text-gray-900 dark:text-white">
              Révolutionnez la gestion de votre 
              <span className="text-blue-700 dark:text-blue-400"> clinique vétérinaire</span>
            </Heading1>
            
            <BodyText className="mb-8 text-gray-800 dark:text-gray-200">
              VetFlow simplifie la gestion quotidienne de votre cabinet vétérinaire avec une interface moderne, 
              intuitive et des fonctionnalités pensées par des professionnels pour des professionnels.
            </BodyText>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button variant="primary" size="lg">
                🚀 Commencer gratuitement
              </Button>
              <Button variant="outline" size="lg">
                📹 Voir la démo
              </Button>
            </div>
            
            <SmallText className="text-gray-700 dark:text-gray-300">
              ✅ Essai gratuit de 14 jours • ✅ Aucune carte bancaire requise • ✅ Support 24/7
            </SmallText>
          </div>
          
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform border border-stone-200 dark:border-gray-700">
              {/* Barre de titre de l'application */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 h-8 rounded-t-lg mb-6 px-4">
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
                {/* Patient en cours */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border-l-4 border-blue-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-sm">
                      🐕
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Max</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Golden Retriever • 5 ans • 32kg</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Mme. Dubois - 06 12 34 56 78</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                        ✓ Consultation terminée
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">14:30 - Vaccination annuelle</p>
                    </div>
                  </div>
                </div>

                {/* Statistiques du jour */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">127</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">Patients actifs</p>
                  </div>
                  <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">8/12</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">RDV aujourd'hui</p>
                  </div>
                  <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">1,240€</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">CA du jour</p>
                  </div>
                </div>

                {/* Prochains rendez-vous */}
                <div className="bg-stone-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">🕒 Prochains RDV</h4>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 