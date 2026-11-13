import { FinalCtaSection } from "./final-cta-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { PainPointsSection } from "./pain-points-section";
import { SecuritySection } from "./security-section";
import { TechnologySection } from "./technology-section";
import { ValuePropositionSection } from "./value-proposition-section";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        <HeroSection />
        <PainPointsSection />
        <ValuePropositionSection />
        <TechnologySection />
        <HowItWorksSection />
        <SecuritySection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
