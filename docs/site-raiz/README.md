# lucashralmeida.github.io — raiz institucional

Raiz canônica de **Dr Lucas HR Almeida** e da **Iniciativa VIA — Vida Integrada e Autônoma**.

Este repositório existe por uma razão estrutural: convenções da web — `robots.txt`, `ai.txt`, `/.well-known/` — só são lidas automaticamente na **raiz do domínio**. Enquanto a raiz respondia 404, todo o portfólio vivia em subcaminho e esses arquivos não tinham efeito. Esta raiz resolve isso e serve de porta de entrada para o [VIA-HUB](https://lucashralmeida.github.io/via-hub/).

## Estrutura

- `index.html` — página de identidade e portas de entrada, com dados estruturados (schema.org) compartilhando o mesmo `@id` das entidades do VIA-HUB, para que os buscadores tratem tudo como **uma única entidade**.
- `robots.txt` — na raiz, referenciando os dois sitemaps.
- `sitemap.xml` — índice de sitemaps (raiz + VIA-HUB).
- `llms.txt` / `ai.txt` — mapa de conteúdo e política de uso para agentes de IA.
- `humans.txt` — créditos.
- `.well-known/security.txt` — RFC 9116.
- `.nojekyll` — publicação direta dos arquivos estáticos, inclusive diretórios ocultos.

## Domínio próprio

Quando `iniciativa-via.com` for apontado ao GitHub Pages, este é o repositório que deve receber o arquivo `CNAME` — a raiz passa a ser o domínio, e todas as URLs canônicas migram junto.

---

**Dr Lucas HR Almeida** — Médico Generalista (FMRP-USP)
CRM-SP: 226836 | CRM-MG: 109752
**Iniciativa VIA — Vida Integrada e Autônoma**
Ciência e Tecnologia a serviço do Cuidado.
