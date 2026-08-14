# DESIGN-SYSTEM.md

## Objetivo
Este pacote documenta o design system inicial da Nexus Flow Tech,
baseado na identidade visual existente e adaptado para uso em web, React,
landing pages e interfaces de produto.

## Arquivos principais
- `tokens/nexus-flow.tokens.json`
- `tokens/nexus-flow.tokens.css`
- `tokens/nexus-flow.tokens.ts`
- `tokens/tailwind.preset.js`
- `brand/BRAND-GUIDELINES.md`
- `components/react/index.ts` — barrel export
- `components/react/BrandLogo.tsx`
- `components/react/HeroLightningSection.tsx`
- `components/react/SectionHeader.tsx`
- `components/react/FeatureCard.tsx`
- `components/react/GlowButton.tsx`
- `components/react/FlowDivider.tsx`

## Componentes implementados
1. **BrandLogo** — Logo flexível com 6 variantes (horizontal, vertical, alt, shield, wordmark, wave)
2. **HeroLightningSection** — Seção hero production-ready com tipografia clamp e logo
3. **SectionHeader** — Cabeçalho de seção com eyebrow, title, body; alinhamento left/center
4. **FeatureCard** — Card de feature com ícone, cor de acento (5 variantes), hover glow
5. **GlowButton** — Botão gradiente com 3 variantes (primary, secondary, outline), 3 tamanhos, hover lift
6. **FlowDivider** — Divisor decorativo com 3 variantes (wave, gradient, dots), 3 tamanhos

## Tokens de Design
### Cores (Primary)
- navy: `#052D72`
- blue: `#0757C9`
- electricBlue: `#24C9FF`
- violet: `#7726D5`
- magenta: `#E22987`
- orange: `#F4510B`
- amber: `#FF9A0B`
- gold: `#ECAF24`

### Neutras
- white: `#FFFFFF`
- surface: `#F6F8FC`
- border: `#D9DDE3`
- graphite: `#10131B`
- black: `#000000`

### Gradientes
- flow: `linear-gradient(90deg, #24C9FF 0%, #0757C9 18%, #7726D5 45%, #E22987 58%, #F4510B 79%, #FF9A0B 100%)`

### Tipografia
- Display/Body: Inter
- Mono: JetBrains Mono
- Escala: xs(12px) → 4xl(64px)
- Pesos: 400, 500, 600, 700

### Espaçamento (base 8px)
- 2xs: 4px, xs: 8px, sm: 12px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 80px

### Border Radius
- sm: 8px, md: 12px, lg: 20px, pill: 9999px

### Shadows
- sm: `0 4px 18px rgba(5,45,114,0.08)`
- md: `0 12px 30px rgba(5,45,114,0.12)`
- glowBlue: `0 0 32px rgba(36,201,255,0.30)`
- glowOrange: `0 0 32px rgba(244,81,11,0.30)`

## Grid e Layout
- Max width: 1280px
- Spacing base: 8px
- Section padding: 80px (vertical) / 24px (horizontal)
- Card padding: 24px
- Preferir seções claras com elementos de brilho e gradiente.

## Direção visual
A composição segue uma lógica próxima ao material de referência do componente
VoltUI: estrutura reutilizável, forte presença visual, aparência production-ready
e foco em seções hero e highlight de capabilities.

## Publicação (npm)
```bash
npm install
npm run build
npm publish --access public
```

## Uso em projetos
```bash
npm install @nexus-flow-tech/design-system
```

```tsx
import { 
  BrandLogo, 
  HeroLightningSection, 
  SectionHeader, 
  FeatureCard, 
  GlowButton, 
  FlowDivider 
} from "@nexus-flow-tech/design-system";

// Tailwind
import nftPreset from "@nexus-flow-tech/design-system/tokens/tailwind.preset.js";
```

## Tailwind CSS
O preset está em `tokens/tailwind.preset.js` e expõe:
- Cores: `nft.navy`, `nft.blue`, `nft.electricBlue`, etc.
- Sombras: `nft-sm`, `nft-md`, `nft-glow-blue`, `nft-glow-orange`
- Gradiente: `bg-nft-flow`
- Border radius: `rounded-nft-sm`, `rounded-nft-md`, `rounded-nft-lg`