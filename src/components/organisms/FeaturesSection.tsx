import FeatureCard from '@/components/molecules/FeatureCard';
import { Heading2, BodyText } from '@/components/atoms/Typography';
import LogoIcon from '@/components/atoms/LogoIcon';
import { Stethoscope, Calendar, Pill, DollarSign, BarChart3, Shield } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: 'Dossiers patients',
      description: 'Fiche animal, propriétaire, historique des RDV, notes et documents liés.'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Planification',
      description: 'Créneaux par vétérinaire, vue jour/semaine, recherche et filtres rapides.'
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: 'Inventaire',
      description: 'Produits et prestations, prix par défaut, suivi des stocks et ajustements.'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Facturation',
      description: 'Factures depuis un RDV, PDF, envoi email, statut payé/en attente, CA du jour.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Indicateurs',
      description: 'Aujourd’hui et ce mois: RDV, CA, payées/en attente, RDV restants.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Rôles & droits',
      description: 'Collaborateurs, rôles multiples et permissions fines par module.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-stone-25 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-emerald-600 mb-3">
            <LogoIcon size={20} />
            <span className="text-xs font-semibold">Pourquoi VetFlow</span>
          </div>
          <Heading2 className="mb-4 text-gray-900 dark:text-white">
            Gérez votre clinique, simplement
          </Heading2>
          <BodyText className="max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
            Planning, dossiers, factures, inventaire et indicateurs clés — rapides, fiables et agréables à utiliser.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 