import React from "react";
import { BrandLogo } from "./BrandLogo";

export function HeroLightningSection() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              letterSpacing: "0.12em",
              color: "#0757C9",
              textTransform: "uppercase",
            }}
          >
            Nexus Flow Tech
          </span>

          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(40px, 7vw, 64px)",
              lineHeight: 1.05,
              margin: 0,
              color: "#052D72",
            }}
          >
            Dados em fluxo.
            <br />
            Decisões em movimento.
          </h1>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 18,
              lineHeight: 1.6,
              color: "#10131B",
              maxWidth: 760,
              margin: 0,
            }}
          >
            Seção hero inspirada em uma linguagem visual de high-tech editorial,
            com foco em clareza, movimento e presença visual da marca.
          </p>
        </div>

        <BrandLogo
          variant="full-horizontal"
          className="nft-hero-logo"
          alt="Nexus Flow Tech horizontal logo"
        />
      </div>
    </section>
  );
}

export default HeroLightningSection;
