import Image from "next/image";

type LogoProps = {
  variant: "full" | "icon";
  className?: string;
  priority?: boolean;
};

const logoConfig = {
  full: {
    src: "/logo/logo-full.svg",
    alt: "JL Web Design — Design. Develop. Elevate.",
    width: 320,
    height: 280,
  },
  icon: {
    src: "/logo/logo-icon.svg",
    alt: "JL Web Design",
    width: 48,
    height: 48,
  },
} as const;

export function Logo({ variant, className = "", priority = false }: LogoProps) {
  const config = logoConfig[variant];

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      priority={priority}
      className={className}
    />
  );
}
