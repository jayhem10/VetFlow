import FeatureCard from '@/components/molecules/FeatureCard';
import { Heading2, BodyText } from '@/components/atoms/Typography';
import { Stethoscope, Calendar, Pill, DollarSign, BarChart3, Shield } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: 'Gestion des patients',
      description: 'Dossiers médicaux complets, historique des soins, allergies, et suivi personnalisé pour chaque animal.'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Planning intelligent',
      description: 'Calendrier optimisé, rappels automatiques, gestion des urgences et synchronisation multi-praticiens.'
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: 'Inventaire médicaments',
      description: 'Suivi des stocks, dates de péremption, commandes automatiques et gestion des traitements.'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Facturation simplifiée',
      description: 'Devis automatiques, facturation électronique, suivi des paiements et rapports financiers.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Rapports et analyses',
      description: 'Tableaux de bord en temps réel, statistiques de performance et aide à la prise de décision.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Sécurité maximale',
      description: 'Conformité RGPD, chiffrement des données, sauvegardes automatiques et accès sécurisé.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-stone-25 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Heading2 className="mb-4 text-gray-900 dark:text-white">
            Tout ce dont vous avez besoin pour votre clinique
          </Heading2>
          <BodyText className="max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
            VetFlow centralise toutes les fonctions essentielles de votre cabinet vétérinaire 
            dans une interface moderne et intuitive.
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