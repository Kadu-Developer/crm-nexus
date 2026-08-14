import React from "react";

type Alignment = "left" | "center";

type Props = {
  title: string;
  eyebrow?: string;
  body?: string;
  alignment?: Alignment;
  className?: string;
  titleTag?: "h1" | "h2" | "h3" | "h4";
};

const colors = {
  title: "#052D72",
  eyebrow: "#0757C9",
  body: "#10131B",
};

const spacing = {
  eyebrowToTitle: 8,
  titleToBody: 16,
};

const fontFamilies = {
  eyebrow: "JetBrains Mono, ui-monospace, monospace",
  title: "Inter, ui-sans-serif, system-ui, sans-serif",
  body: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export function SectionHeader({
  title,
  eyebrow,
  body,
  alignment = "left",
  className = "",
  titleTag = "h2",
}: Props) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: alignment === "center" ? "center" : "flex-start",
    textAlign: alignment,
    maxWidth: alignment === "center" ? 800 : "none",
    marginLeft: alignment === "center" ? "auto" : 0,
    marginRight: alignment === "center" ? "auto" : 0,
    gap: 0,
  };

  const Tag = titleTag;

  return (
    <div style={containerStyle} className={className}>
      {eyebrow && (
        <span
          style={{
            fontFamily: fontFamilies.eyebrow,
            fontSize: "12px",
            letterSpacing: "0.12em",
            color: colors.eyebrow,
            textTransform: "uppercase",
            marginBottom: spacing.eyebrowToTitle,
            display: "block",
          }}
        >
          {eyebrow}
        </span>
      )}
      <Tag
        style={{
          fontFamily: fontFamilies.title,
          fontSize: "clamp(28px, 5vw, 48px)",
          lineHeight: 1.1,
          margin: 0,
          color: colors.title,
          fontWeight: 700,
          marginBottom: body ? spacing.titleToBody : 0,
        }}
      >
        {title}
      </Tag>
      {body && (
        <p
          style={{
            fontFamily: fontFamilies.body,
            fontSize: "18px",
            lineHeight: 1.6,
            color: colors.body,
            maxWidth: 760,
            margin: 0,
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;