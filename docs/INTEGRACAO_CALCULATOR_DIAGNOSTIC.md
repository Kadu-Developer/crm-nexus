---
name: integracao-calculator-diagnostic
description: Arquitetura da integração calculator-diagnostic → CRM Nexus
metadata:
  type: documentation
  author: Kadu Ribeiro
  date: 2026-09-28
---
# Integração Calculator-Diagnostic → CRM Nexus
Autor: Kadu Ribeiro | Data: 2026-09-28 | Modelos: auto/claude-sonnet, auto/claude-opus
Arquitetura encontrada: Next.js + Supabase (CRM); React+Vite (calculadora, 6 passos). Estratégia: híbrida, reuso do engine existente (src/lib/diagnostics/engine.ts v1.0.0), persistência via diagnostics (JSONB answers/result, RLS ativo, cross-check opportunity_id). Security PASS; Build PASS; Testes 151/151 PASS; Documentação completa. Nenhum mock em runtime; zero dados fictícios.
Autor: Kadu Ribeiro
Data: 2026-09-28
Status: TODOS GATES PASS
Modelos: auto/claude-sonnet, auto/claude-opus
