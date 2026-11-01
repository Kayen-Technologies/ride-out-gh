import { TestimonialHeroPanel } from "@/components/auth/testimonial-hero-panel";

export function LoginHeroPanel() {
  return (
    <TestimonialHeroPanel
      imageSrc="/auth/login-hero.png"
      imageWidth={2048}
      imageHeight={1536}
      imageClassName="absolute top-[-0.03%] left-[-18.26%] h-[100.07%] w-[150.08%] max-w-none object-cover"
      quote="“I appreciated having one place to manage my vehicle request and stay informed about the process. It made everything easier to follow.”"
      name="Ama Owusu"
      role="Event Organizer"
      avatarSrc="/auth/login-testimonial-avatar.png"
      avatarSize={300}
    />
  );
}
