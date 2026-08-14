import React from "react";

type Variant =
  | "full-horizontal"
  | "full-vertical"
  | "full-horizontal-alt"
  | "shield"
  | "wordmark"
  | "wave";

type Props = {
  variant?: Variant;
  alt?: string;
  className?: string;
};

const sources: Record<Variant, string> = {
  "full-horizontal": "/assets/logos/logo-full-horizontal.png",
  "full-vertical": "/assets/logos/logo-full-vertical.png",
  "full-horizontal-alt": "/assets/logos/logo-full-horizontal-alt.png",
  shield: "/assets/logos/logo-shield-symbol.png",
  wordmark: "/assets/logos/logo-wordmark-block.png",
  wave: "/assets/logos/logo-wave-element.png",
};

export function BrandLogo({
  variant = "full-horizontal",
  alt = "Nexus Flow Tech",
  className = "",
}: Props) {
  return (
    <img
      src={sources[variant]}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export default BrandLogo;
