# Iniciativa VIA — portal institucional

Portal público da **Iniciativa VIA — Vida Integrada e Autônoma**. O site organiza o portfólio de Dr Lucas HR em uma arquitetura institucional voltada a medicina, pesquisa, tecnologia, saúde pública e formação de parcerias.

## Acesso

O portal é servido pelo GitHub Pages sob o domínio próprio `iniciativa-via.com`, com HTTPS ativo. As URLs canônicas do hub são as listadas abaixo.

- Portal: <https://iniciativa-via.com/via-hub/>
- Sobre (perfil do fundador): <https://iniciativa-via.com/via-hub/sobre/>
- Mentoria Sincronismo Híbrido (oferta paga): <https://iniciativa-via.com/via-hub/mentoria-sincronismo-hibrido/>
- VIA MENTE — MBRP-8: <https://iniciativa-via.com/via-hub/via-mente-mbrp/>
- VIA Literacia — Programação, Git e GitHub: <https://iniciativa-via.com/via-hub/via-literacia-programacao-github/>
- Ponte YouTube ↔ módulos: <https://iniciativa-via.com/via-hub/ponte/>
- VIA Economia & Saúde: <https://iniciativa-via.com/via-hub/via-economia-saude/>
- Bem-Estar Multissensorial: <https://iniciativa-via.com/via-hub/bem-estar-multissensorial/>
- VIA Soberania Informacional: <https://iniciativa-via.com/via-hub/soberania-informacional/>
- Regulação Federal de IA em Saúde: <https://iniciativa-via.com/via-hub/regulacao-federal-ia/>
- EVAM Conversor: <https://iniciativa-via.com/via-hub/regulacao-federal-ia/evam/>
- Saúde na Última Semana: <https://iniciativa-via.com/via-hub/sarampo-alertas-2026/>

## Estrutura

**Raiz do site (GitHub Pages)**

- `index.html` — conteúdo e semântica da página.
- `styles.css` — sistema visual responsivo com a paleta institucional VIA.
- `app.js` — navegação móvel, filtros e renderização segura do portfólio.
- `projects.json` — fonte versionada das demonstrações e respectivos status.
- `sitemap.xml` — mapa de URLs do hub para indexação em buscadores.
- `robots.txt` — diretivas de rastreamento para crawlers, referenciando o sitemap.
- `ai.txt` / `llms.txt` — mapa de conteúdo e política de uso para agentes de IA.
- `humans.txt` — créditos.
- `SECURITY.md` — política de segurança e canal de divulgação responsável.
- `.well-known/security.txt` — política de segurança em formato padronizado (RFC 9116).
- `.nojekyll` — publicação direta dos arquivos estáticos pelo GitHub Pages.

**Governança de repositório**

- `.github/ISSUE_TEMPLATE/parceria.yml` — formulário para propostas institucionais.
- `.github/ISSUE_TEMPLATE/config.yml` — configuração do seletor de templates de issue.
- `.claude/settings.json` — configuração de sessão para agentes Claude Code operando neste repositório.
- `assets/` — imagens institucionais (retrato do fundador, selo de marca, cartão social do hub).

**Módulos**

- `sobre/index.html` — página institucional "Sobre", com o perfil do fundador.
- `mentoria-sincronismo-hibrido/` — landing pública da oferta de mentoria paga (calibração de juízo clínico).
- `via-mente-mbrp/index.html` — webapp psicoeducacional MBRP-8.
- `via-mente-mbrp/README.md` — escopo e documentação do módulo.
- `via-literacia-programacao-github/index.html` — trilha web introdutória com progresso local.
- `via-literacia-programacao-github/apostila.md` — fonte pedagógica versionada de programação, Git e GitHub.
- `via-literacia-programacao-github/README.md` — documentação editorial e técnica do módulo.
- `via-economia-saude/index.html` — trilha interativa com diagnóstico, simuladores locais e plano de ação.
- `via-economia-saude/conteudo.md` — fonte editorial versionada de economia e saúde.
- `via-economia-saude/EDITORIAL.md` — diretrizes editoriais do módulo.
- `via-economia-saude/README.md` — escopo, privacidade, limites e manutenção do módulo.
- `via-economia-saude/og.png` — cartão social alinhado ao branding VIA.
- `bem-estar-multissensorial/index.html` — guia multissensorial de bem-estar (música, cores e aromas).
- `bem-estar-multissensorial/README.md` — escopo, limitações e documentação do módulo.
- `soberania-informacional/index.html` — frente de proteção de dados, autonomia e direitos digitais.
- `soberania-informacional/README.md` — tese, escopo e limites editoriais do módulo.
- `soberania-informacional/docs/` — protocolo de evidência, modelo de representação administrativa (ANPD) e tese do módulo.
- `regulacao-federal-ia/index.html` — briefing interativo sobre governança federativa de transferências interestaduais de pacientes críticos no SUS.
- `regulacao-federal-ia/README.md` — diagnóstico sistêmico, analogia operacional (CRM/AF447) e proposta técnica do módulo.
- `regulacao-federal-ia/evam/` — conversor local de narrativa clínica para resumo e schema regulatório versionados.
- `regulacao-federal-ia/lab/` — sandbox sintético de matching entre necessidade clínica e capacidade resolutiva.
- `sarampo-alertas-2026/index.html` — boletim de utilidade pública em saúde (sarampo e prevenção), alinhado à paleta VIA.
- `sarampo-alertas-2026/README.md` — escopo, limitações e documentação do módulo.

**Documentação interna**

- `docs/decisoes/0001-tese-fundadora.md` — registro de decisão de arquitetura (ADR 0001): tese fundadora da Iniciativa VIA.
- A raiz do domínio próprio é versionada exclusivamente em `LucasHRAlmeida/LucasHRAlmeida.github.io`; este repositório não mantém espelho publicável.

## Princípios editoriais

1. Separar a fonte científica da ferramenta que a utiliza.
2. Declarar estágio, escopo e limitações de cada demonstração.
3. Evitar alegações de capacidade que o protótipo ainda não implementa.
4. Tratar software como argumento verificável, não como peça cenográfica.

## Desenvolvimento local

Não há etapa de build nem dependências externas:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000`.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 16 99618-0196](https://wa.me/5516996180196)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.

