# Nexus Flow Tech - Design System Package

Este pacote organiza a identidade visual e os arquivos-base do design system.

## Estrutura

- `assets/logos/` — logos e elementos transparentes em PNG
- `brand/` — diretrizes da marca
- `tokens/` — tokens em JSON, CSS, TS e preset de Tailwind
- `components/react/` — componentes React (6 componentes production-ready)
- `docs/` — documentação do design system
- `examples/` — exemplo HTML de uso
- `other-files/` — manifestos e arquivos auxiliares
- `dist/` — build output (gerado via `npm run build`)

## Conteúdo principal

### Assets
- full horizontal
- full vertical
- full horizontal alt
- shield symbol
- wordmark block
- wave element

### Tokens (4 formatos)
- `nexus-flow.tokens.json` — Design Tokens Community Group format
- `nexus-flow.tokens.css` — CSS Custom Properties
- `nexus-flow.tokens.ts` — TypeScript types
- `tailwind.preset.js` — Tailwind CSS preset

### Componentes React
| Componente | Descrição |
|------------|-----------|
| `BrandLogo` | Logo flexível com 6 variantes |
| `HeroLightningSection` | Seção hero production-ready |
| `SectionHeader` | Cabeçalho com eyebrow, title, body |
| `FeatureCard` | Card de feature com 5 cores de acento |
| `GlowButton` | Botão gradiente 3 variantes × 3 tamanhos |
| `FlowDivider` | Divisor decorativo 3 variantes × 3 tamanhos |

### Export único
```tsx
import { 
  BrandLogo, 
  HeroLightningSection, 
  SectionHeader, 
  FeatureCard, 
  GlowButton, 
  FlowDivider 
} from "@nexus-flow-tech/design-system";
```

## Instalação e uso

```bash
npm install @nexus-flow-tech/design-system
```

### Tailwind CSS
```js
// tailwind.config.js
import nftPreset from "@nexus-flow-tech/design-system/tokens/tailwind.preset.js";

export default {
  presets: [nftPreset],
  // ...
};
```

## Build local

```bash
npm install
npm run build
```

## Observação

Os PNGs transparentes são os arquivos-base visuais deste pacote. Para uso em produção, recomenda-se otimizar as imagens (WebP, AVIF) ou usar SVGs quando disponíveis.