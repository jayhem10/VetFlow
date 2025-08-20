import PublicHeader from '@/components/organisms/PublicHeader';
import HeroSection from '@/components/organisms/HeroSection';
import FeaturesSection from '@/components/organisms/FeaturesSection';
import PricingSection from '@/components/organisms/PricingSection';
import TestimonialsSection from '@/components/organisms/TestimonialsSection';
import CTASection from '@/components/organisms/CTASection';
import Footer from '@/components/organisms/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicHeader />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
