import Card from '@/components/atoms/Card';
import { Heading3 } from '@/components/atoms/Typography';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <Heading3 className="mb-3 text-gray-900 dark:text-white">{title}</Heading3>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{description}</p>
    </Card>
  );
} 