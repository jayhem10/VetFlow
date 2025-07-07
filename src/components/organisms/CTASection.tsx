import Button from '@/components/atoms/Button';
import { Heading2, BodyText } from '@/components/atoms/Typography';

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
            🚀 Commencer gratuitement
          </Button>
          <Button variant="outline" size="lg">
            📞 Nous contacter
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-gray-700 dark:text-gray-300">
          ✅ Installation en 5 minutes • ✅ Formation personnalisée incluse • ✅ Support prioritaire
        </p>
      </div>
    </section>
  );
} 