import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import { Heading3 } from '@/components/atoms/Typography';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular = false
}: PricingCardProps) {
  return (
    <Card 
      variant="pricing" 
      className={popular ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/30 border-2 border-green-500 dark:border-green-400 transform scale-105 shadow-2xl' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'}
      hover={false}
    >
      {popular && (
        <div className="text-center mb-4">
          <span className="bg-green-700 dark:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            ⭐ Le plus populaire
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <Heading3 className={`mb-2 ${popular ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
          {name}
        </Heading3>
        <div className="flex items-baseline justify-center">
          <span className={`text-4xl font-bold ${popular ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
            {price}
          </span>
          <span className={`ml-1 ${popular ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
            {period}
          </span>
        </div>
        <p className={`mt-2 ${popular ? 'text-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-300'}`}>
          {description}
        </p>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span className={`mr-3 ${popular ? 'text-green-700 dark:text-green-400' : 'text-green-500 dark:text-green-400'}`}>✓</span>
            <span className={popular ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      <Button
        variant={popular ? 'primary' : 'outline'}
        className="w-full"
      >
        Commencer maintenant
      </Button>
    </Card>
  );
} 