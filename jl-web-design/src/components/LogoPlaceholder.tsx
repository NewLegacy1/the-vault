type LogoPlaceholderProps = {
  size?: "sm" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: {
    box: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
    label: "text-[10px]",
  },
  lg: {
    box: "h-36 w-36 rounded-3xl md:h-44 md:w-44",
    icon: "h-16 w-16 md:h-20 md:w-20",
    label: "text-sm",
  },
};

export function LogoPlaceholder({
  size = "sm",
  className = "",
}: LogoPlaceholderProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      aria-label="Logo placeholder — replace with your logo"
    >
      <div
        className={`flex items-center justify-center border-2 border-dashed border-sky-300/60 bg-sky-400/10 ${styles.box}`}
      >
        <svg
          className={`text-sky-300 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
      </div>
      {size === "lg" && (
        <span className={`font-medium uppercase tracking-widest text-sky-300/70 ${styles.label}`}>
          Your logo here
        </span>
      )}
    </div>
  );
}
