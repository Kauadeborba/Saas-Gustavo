import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection, BenefitsSection, CategoriesSection } from '@/components/home-sections';
import { CuponsSection } from '@/components/cupons-section';
import { StoreProvider } from '@/lib/store-context';

export default function HomePage() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <BenefitsSection />
          <CategoriesSection />
          <CuponsSection />
        </main>
        <Footer />
      </div>
    </StoreProvider>
  );
}
