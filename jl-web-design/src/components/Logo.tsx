import Image from "next/image";

type LogoProps = {
  variant: "full" | "icon";
  className?: string;
  priority?: boolean;
};

const logoConfig = {
  full: {
    src: "/logo/logo-full.png",
    fallbackSrc: "/logo/logo-full.svg",
    alt: "JL Web Design",
    width: 420,
    height: 300,
  },
  icon: {
    src: "/logo/logo-icon.png",
    fallbackSrc: "/logo/logo-icon.svg",
    alt: "JL Web Design",
    width: 120,
    height: 120,
  },
} as const;

export function Logo({ variant, className = "", priority = false }: LogoProps) {
  const config = logoConfig[variant];

  return (
    <picture>
      <source srcSet={config.src} type="image/png" />
      <Image
        src={config.fallbackSrc}
        alt={config.alt}
        width={config.width}
        height={config.height}
        priority={priority}
        className={className}
      />
    </picture>
  );
}
