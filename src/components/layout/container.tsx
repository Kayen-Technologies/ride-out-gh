import { cn } from "cn";

type ContainerProps = React.ComponentProps<"div"> & {
  /** Use header/footer horizontal inset (`--gutter-nav`) instead of content gutter (`--gutter`). */
  nav?: boolean;
};

export function Container({ nav = false, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)]",
        nav ? "px-[var(--gutter-nav)]" : "px-[var(--gutter)]",
        className,
      )}
      {...props}
    />
  );
}
