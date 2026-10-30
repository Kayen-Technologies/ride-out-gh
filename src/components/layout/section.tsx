import { cn } from "cn";

import { Container } from "@/components/layout/container";

const sectionBackgrounds = {
  background: "bg-background",
  card: "bg-card",
  black: "bg-black",
  raised: "bg-surface-raised",
} as const;

type SectionBackground = keyof typeof sectionBackgrounds;

type SectionProps = Omit<React.ComponentProps<"section">, "children"> & {
  background: SectionBackground;
  containerClassName?: string;
  nav?: boolean;
  children: React.ReactNode;
};

export function Section({
  background,
  className,
  containerClassName,
  nav = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("w-full py-[var(--section-y)]", sectionBackgrounds[background], className)}
      {...props}
    >
      <Container nav={nav} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}
