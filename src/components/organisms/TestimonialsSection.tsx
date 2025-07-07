import TestimonialCard from '@/components/molecules/TestimonialCard';
import { Heading2, BodyText } from '@/components/atoms/Typography';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "VetFlow a révolutionné notre façon de travailler. Le gain de temps est impressionnant et nos clients apprécient la facilité de prise de rendez-vous.",
      author: "Dr. Marie Dubois",
      role: "Vétérinaire",
      clinic: "Clinique des Amis à Quatre Pattes"
    },
    {
      quote: "Interface très intuitive et fonctionnalités complètes. La gestion de l'inventaire nous fait économiser beaucoup d'argent en évitant les ruptures de stock.",
      author: "Dr. Pierre Martin",
      role: "Directeur",
      clinic: "Centre Vétérinaire Saint-Antoine"
    },
    {
      quote: "Le support client est exceptionnel. L'équipe est toujours disponible pour nous aider. Je recommande VetFlow à tous mes confrères.",
      author: "Dr. Sophie Legrand",
      role: "Vétérinaire spécialisée",
      clinic: "Clinique Vétérinaire du Parc"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-stone-25 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Heading2 className="mb-4 text-gray-900 dark:text-white">
            Ils nous font confiance
          </Heading2>
          <BodyText className="max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
            Découvrez pourquoi plus de 2,500 vétérinaires ont choisi VetFlow 
            pour moderniser leur pratique quotidienne.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              clinic={testimonial.clinic}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 