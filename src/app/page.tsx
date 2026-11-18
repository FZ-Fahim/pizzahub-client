import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryStrip } from '@/components/home/category-strip';
import { FeaturedItems } from '@/components/home/featured-items';
import { WhyChoose } from '@/components/home/why-choose';
import { HowItWorks } from '@/components/home/how-it-works';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroBanner />
      <CategoryStrip />
      <FeaturedItems />
      <WhyChoose />
      <HowItWorks />
    </main>
  );
}
