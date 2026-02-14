import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { FeaturesGrid } from "@/components/features-grid"
import { HowItWorks } from "@/components/how-it-works"
import { BusinessTypes } from "@/components/business-types"
import { Pricing } from "@/components/pricing"
import { MobileApp } from "@/components/mobile-app"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <FeaturesGrid />
        <HowItWorks />
        <BusinessTypes />
        <Pricing />
        <MobileApp />
        <FinalCTA />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
