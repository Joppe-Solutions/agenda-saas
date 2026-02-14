import { Header, Hero, Features, Testimonials, HowItWorks, UseCases, Pricing, FAQ, MobileApp, CTA, Footer } from "@/components/landing";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <FAQ />
        <MobileApp />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}