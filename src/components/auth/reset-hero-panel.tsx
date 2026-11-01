import { QuoteHeroPanel } from "@/components/auth/quote-hero-panel";

// Figma 120:9787. The photo export (node 120:9789) is already cropped to the 652 x 739 panel.
export function ResetHeroPanel() {
  return (
    <QuoteHeroPanel
      src="/auth/reset-hero.jpg"
      quote="“Your account should be easy to access and simple to manage. We're here to help you stay in control of your Ride-Out experience.”"
    />
  );
}
