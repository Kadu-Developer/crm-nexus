import React from "react";

type Variant = "wave" | "gradient" | "dots";
type Size = "sm" | "md" | "lg";

type Props = {
  variant?: Variant;
  size?: Size;
  className?: string;
  color?: string;
};

const sizeStyles: Record<Size, { height: string; gap: string }> = {
  sm: { height: "24px", gap: "16px" },
  md: { height: "48px", gap: "32px" },
  lg: { height: "80px", gap: "48px" },
};

export function FlowDivider({
  variant = "wave",
  size = "md",
  className = "",
  color,
}: Props) {
  const { height, gap } = sizeStyles[size];
  const accentColor = color || "#0757C9";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap,
    width: "100%",
    height,
  };

  if (variant === "wave") {
    return (
      <div style={containerStyle} className={className} role="separator" aria-orientation="horizontal">
        <svg
          width="120"
          height="24"
          viewBox="0 0 120 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path
            d="M0 12 C20 12, 40 0, 60 0 C80 0, 100 24, 120 24"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0 12 C20 12, 40 24, 60 24 C80 24, 100 0, 120 0"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
            style={{ transform: "translateY(4px)" }}
          />
        </svg>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div
        style={{
          ...containerStyle,
          height: size === "sm" ? "2px" : size === "md" ? "3px" : "4px",
        }}
        className={className}
        role="separator"
        aria-orientation="horizontal"
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            background: "linear-gradient(90deg, transparent 0%, #24C9FF 20%, #0757C9 40%, #7726D5 60%, #E22987 80%, #F4510B 100%, transparent 100%)",
            borderRadius: "9999px",
            maxWidth: "800px",
          }}
        />
      </div>
    );
  }

  if (variant === "dots") {
    const dotCount = size === "sm" ? 5 : size === "md" ? 9 : 13;
    const dots = Array.from({ length: dotCount }, (_, i) => (
      <div
        key={i}
        style={{
          width: size === "sm" ? "6px" : size === "md" ? "8px" : "10px",
          height: size === "sm" ? "6px" : size === "md" ? "8px" : "10px",
          borderRadius: "50%",
          background: i % 2 === 0 ? accentColor : "#FF9A0B",
          opacity: i % 2 === 0 ? 0.8 : 0.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    ));

    return (
      <div
        style={{
          ...containerStyle,
          gap: size === "sm" ? "8px" : size === "md" ? "12px" : "16px",
        }}
        className={className}
        role="separator"
        aria-orientation="horizontal"
      >
        {dots}
      </div>
    );
  }

  return null;
}

export default FlowDivider;