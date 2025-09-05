import PricingCard from '@/components/molecules/PricingCard';
import { Heading2, BodyText } from '@/components/atoms/Typography';

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '64.90€',
      period: 'mois',
      description: 'Cabinets individuels',
      features: [
        'Planning (1 praticien)',
        'Clients: 1 000 inclus',
        'Animaux: 2 000 inclus',
        'Factures PDF + envoi email',
        'Documents patients (1 Go)'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '99€',
      period: 'mois',
      description: 'Cliniques & équipes',
      features: [
        'Planning (jusqu’à 5 praticiens)',
        'Clients: 10 000 inclus',
        'Animaux: illimités',
        'Inventaire & seuils',
        'Rôles & permissions',
        'Exports & rapports',
        'Documents patients (10 Go)'
      ],
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Heading2 className="mb-4 text-gray-900 dark:text-white">
            Choisissez votre formule
          </Heading2>
          <BodyText className="max-w-2xl mx-auto text-gray-800 dark:text-gray-200">
            Des tarifs transparents et adaptés à la taille de votre cabinet vétérinaire. 
            Essai gratuit de 14 jours sur toutes les formules.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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