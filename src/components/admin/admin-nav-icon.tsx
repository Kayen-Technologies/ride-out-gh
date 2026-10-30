type AdminNavIconProps = {
  src: string;
  active: boolean;
};

/** Renders a monochrome Figma nav icon at 20×20; colour comes from `currentColor`. */
export function AdminNavIcon({ src, active }: AdminNavIconProps) {
  return (
    <span
      aria-hidden
      className={`size-5 shrink-0 bg-current ${active ? "text-primary" : "text-sidebar-foreground"}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
