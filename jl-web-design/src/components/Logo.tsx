type LogoProps = {
  variant: "full" | "icon";
  className?: string;
  priority?: boolean;
};

const logoConfig = {
  full: {
    src: "/logo/logo-full.svg",
    alt: "JL Web Design",
    width: 480,
    height: 340,
  },
  icon: {
    src: "/logo/logo-icon.svg",
    alt: "JL Web Design",
    width: 120,
    height: 120,
  },
} as const;

export function Logo({ variant, className = "", priority = false }: LogoProps) {
  const config = logoConfig[variant];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}
