# iniciativa-via.com — raiz institucional

Raiz canônica de **Dr Lucas HR Almeida** e da **Iniciativa VIA — Vida Integrada e Autônoma**, publicada pelo repositório `LucasHRAlmeida.github.io` (site de usuário do GitHub Pages) sob o domínio próprio `iniciativa-via.com`.

Este repositório existe por uma razão estrutural: convenções da web — `robots.txt`, `ai.txt`, `/.well-known/` — só são lidas automaticamente na **raiz do domínio**. Enquanto a raiz respondia 404, todo o portfólio vivia em subcaminho e esses arquivos não tinham efeito. Esta raiz resolve isso e serve de porta de entrada para o [VIA-HUB](https://iniciativa-via.com/via-hub/).

## Estrutura

- `index.html` — página de identidade e portas de entrada, com dados estruturados (schema.org) compartilhando o mesmo `@id` das entidades do VIA-HUB, para que os buscadores tratem tudo como **uma única entidade**.
- `robots.txt` — na raiz, referenciando os dois sitemaps.
- `sitemap.xml` — índice de sitemaps (raiz + VIA-HUB).
- `llms.txt` / `ai.txt` — mapa de conteúdo e política de uso para agentes de IA.
- `humans.txt` — créditos.
- `.well-known/security.txt` — RFC 9116.
- `.nojekyll` — publicação direta dos arquivos estáticos, inclusive diretórios ocultos.

## Domínio próprio

`iniciativa-via.com` foi apontado ao GitHub Pages e está ativo. Este repositório contém o arquivo `CNAME` do domínio, o HTTPS está habilitado e a raiz responde no domínio próprio. Todas as URLs canônicas — `canonical`, `og:url`, `@id` do JSON-LD e sitemaps — migraram junto, em uma passada única, para não fragmentar a entidade.

---

**Dr Lucas HR Almeida** — Médico Generalista (FMRP-USP)
CRM-SP: 226836 | CRM-MG: 109752
**Iniciativa VIA — Vida Integrada e Autônoma**
Ciência e Tecnologia a serviço do Cuidado.
