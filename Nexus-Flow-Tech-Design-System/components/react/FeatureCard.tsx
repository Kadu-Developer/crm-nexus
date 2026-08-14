import React from "react";

type Props = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  accentColor?: "blue" | "violet" | "magenta" | "orange" | "amber";
  className?: string;
  onClick?: () => void;
  href?: string;
};

const accentStyles: Record<NonNullable<Props["accentColor"]>, React.CSSProperties> = {
  blue: { borderColor: "#0757C9", glowColor: "rgba(7,87,201,0.3)" },
  violet: { borderColor: "#7726D5", glowColor: "rgba(119,38,213,0.3)" },
  magenta: { borderColor: "#E22987", glowColor: "rgba(226,41,135,0.3)" },
  orange: { borderColor: "#F4510B", glowColor: "rgba(244,81,11,0.3)" },
  amber: { borderColor: "#FF9A0B", glowColor: "rgba(255,154,11,0.3)" },
};

export function FeatureCard({
  title,
  description,
  icon,
  accentColor = "blue",
  className = "",
  onClick,
  href,
}: Props) {
  const accent = accentStyles[accentColor];
  const isInteractive = onClick || href;

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #D9DDE3",
    borderLeft: `4px solid ${accent.borderColor}`,
    borderRadius: "12px",
    padding: "24px",
    transition: "all 0.3s ease",
    cursor: isInteractive ? "pointer" : "default",
    position: "relative",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const iconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F6F8FC 0%, #FFFFFF 100%)",
    borderRadius: "12px",
    border: "1px solid #D9DDE3",
    color: accent.borderColor,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1.3,
    color: "#052D72",
    margin: 0,
  };

  const descStyle: React.CSSProperties = {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#10131B",
    margin: 0,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractive) {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 20px 40px ${accent.glowColor}`;
      e.currentTarget.style.borderColor = accent.borderColor;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractive) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.borderColor = "#D9DDE3";
      e.currentTarget.style.borderLeft = `4px solid ${accent.borderColor}`;
    }
  };

  const content = (
    <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={descStyle}>{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: "none", color: "inherit" }}>{content}</a>;
  }

  if (onClick) {
    return <div onClick={onClick} role="button" tabIndex={0}>{content}</div>;
  }

  return content;
}

export default FeatureCard;