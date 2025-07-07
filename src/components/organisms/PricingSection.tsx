import PricingCard from '@/components/molecules/PricingCard';
import { Heading2, BodyText } from '@/components/atoms/Typography';

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '49€',
      period: 'par mois',
      description: 'Parfait pour les cabinets individuels',
      features: [
        'Jusqu\'à 500 patients',
        'Planning de base',
        'Facturation simple',
        'Support email',
        'Sauvegardes quotidiennes'
      ],
      popular: false
    },
    {
      name: 'Professionnel',
      price: '99€',
      period: 'par mois',
      description: 'Idéal pour les cliniques moyennes',
      features: [
        'Patients illimités',
        'Planning avancé',
        'Facturation complète',
        'Inventaire médical',
        'Rapports détaillés',
        'Support prioritaire',
        'Formation incluse'
      ],
      popular: true
    },
    {
      name: 'Entreprise',
      price: '199€',
      period: 'par mois',
      description: 'Pour les grandes structures',
      features: [
        'Tout du plan Professionnel',
        'Multi-sites',
        'API personnalisée',
        'Intégrations avancées',
        'Support dédié 24/7',
        'Formation sur site',
        'Personnalisation'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Heading2 className="mb-4 text-gray-900 dark:text-white">
            Choisissez votre formule
          </Heading2>
          <BodyText className="max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
            Des tarifs transparents et adaptés à la taille de votre cabinet vétérinaire. 
            Essai gratuit de 14 jours sur toutes les formules.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 