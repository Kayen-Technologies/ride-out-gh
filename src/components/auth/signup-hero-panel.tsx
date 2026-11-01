import { TestimonialHeroPanel } from "@/components/auth/testimonial-hero-panel";

// Figma 120:9659. The photo export (node 120:9661) is already cropped to the 652 x 739 panel.
export function SignUpHeroPanel() {
  return (
    <TestimonialHeroPanel
      imageSrc="/auth/signup-hero.jpg"
      imageWidth={1304}
      imageHeight={1478}
      quote="“Finding the right car should feel exciting, not overwhelming. Ride-Out made the process feel much simpler from the very beginning.”"
      name="Kofi Owusu"
      role="Event Organizer"
      avatarSrc="/auth/signup-testimonial-avatar.png"
      avatarSize={120}
    />
  );
}
