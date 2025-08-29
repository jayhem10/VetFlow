import Button from '@/components/atoms/Button';
import { Heading2, BodyText } from '@/components/atoms/Typography';
import { Phone, Rocket, Check } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <Heading2 className="mb-6 text-gray-900 dark:text-white">
          Prêt à transformer votre clinique vétérinaire ?
        </Heading2>
        
        <BodyText className="mb-8 text-gray-800 dark:text-gray-200">
          Rejoignez plus de 2,500 vétérinaires qui font déjà confiance à VetFlow 
          pour optimiser leur pratique quotidienne.
        </BodyText>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg">
            <Rocket className="w-4 h-4" /> Commencer gratuitement
          </Button>
          <Button variant="outline" size="lg">
            <Phone className="w-4 h-4" /> Nous contacter
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-gray-700 dark:text-gray-300">
          <Check className="w-3 h-3 inline" /> Installation en 5 minutes • <Check className="w-3 h-3 inline" /> Formation personnalisée incluse • <Check className="w-3 h-3 inline" /> Support prioritaire
        </p>
      </div>
    </section>
  );
} 