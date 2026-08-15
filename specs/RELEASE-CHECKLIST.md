# LEGACY RELEASE CHECKLIST — PRESERVED

> The authoritative final gate is now `FINAL-RELEASE-GATE.md`.

# ProspectFlow — Release Checklist

Execute este arquivo somente após concluir `020-production-deployment/004-implement.md`.

## Produto
- [ ] Cadastro e login funcionam
- [ ] Workspaces são isolados
- [ ] RBAC está aplicado
- [ ] Google Maps provider funciona
- [ ] Busca assíncrona funciona
- [ ] Leads são normalizados
- [ ] Deduplicação funciona
- [ ] Listas e tags funcionam
- [ ] CRM/Kanban funciona
- [ ] Tasks e activities funcionam
- [ ] Lead scoring funciona
- [ ] Créditos são transacionais
- [ ] Planos e billing funcionam
- [ ] Dashboard funciona
- [ ] Import/export funciona
- [ ] Admin está protegido
- [ ] Auditoria e observabilidade estão ativas
- [ ] Hardening de segurança concluído

## Infraestrutura
- [ ] Build de produção passa
- [ ] HTTPS ativo
- [ ] PostgreSQL com backup
- [ ] Restore testado
- [ ] Redis protegido
- [ ] Worker monitorado
- [ ] Health checks ativos
- [ ] Secrets fora do código
- [ ] CI/CD funcional

## Segurança
- [ ] Tenant isolation testado
- [ ] Rate limiting ativo
- [ ] Cookies seguros
- [ ] CSP/security headers
- [ ] Idempotência aplicada
- [ ] Logs não expõem secrets

## Release
- [ ] Seed dos planos executado
- [ ] Primeiro platform admin criado
- [ ] Smoke test em produção
- [ ] Jornada completa validada
