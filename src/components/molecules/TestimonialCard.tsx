import Card from '@/components/atoms/Card';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  clinic: string;
}

export default function TestimonialCard({ quote, author, role, clinic }: TestimonialCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-600">
      <div className="text-4xl mb-4">👨‍⚕️</div>
      <blockquote className="text-gray-800 dark:text-gray-200 mb-4 italic text-base leading-relaxed">
        "{quote}"
      </blockquote>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white text-lg">{author}</div>
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{role}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{clinic}</div>
      </div>
    </Card>
  );
} 