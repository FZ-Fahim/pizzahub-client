import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryStrip } from '@/components/home/category-strip';
import { FeaturedItems } from '@/components/home/featured-items';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroBanner />
      <CategoryStrip />
      <FeaturedItems />
    </main>
  );
}
