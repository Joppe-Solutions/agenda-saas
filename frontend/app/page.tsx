import { Header, Hero, Features, HowItWorks, UseCases, Pricing, CTA, Footer } from "@/components/landing";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
