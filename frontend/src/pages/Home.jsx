import { Footer } from "../components/layout";
import { Section } from "../components/common";
import { Hero, FeaturedVendors, Categories } from "../components/features/home";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      <Hero />

      <Section>
        <FeaturedVendors />
      </Section>

      <Section>
        <Categories />
      </Section>

      <Footer />
    </div>
  );
}
