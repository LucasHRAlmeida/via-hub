# Iniciativa VIA — portal institucional

Portal público da **Iniciativa VIA — Vida Integrada e Autônoma**. O site organiza o portfólio de Dr Lucas HR em uma arquitetura institucional voltada a medicina, pesquisa, tecnologia, saúde pública e formação de parcerias.

## Acesso

- GitHub Pages: <https://lucashralmeida.github.io/via-hub/>
- Mentoria Sincronismo Híbrido (oferta paga): <https://lucashralmeida.github.io/via-hub/mentoria-sincronismo-hibrido/>
- VIA MENTE — MBRP-8: <https://lucashralmeida.github.io/via-hub/via-mente-mbrp/>
- VIA Literacia — Programação, Git e GitHub: <https://lucashralmeida.github.io/via-hub/via-literacia-programacao-github/>
- Bem-Estar Multissensorial: <https://lucashralmeida.github.io/via-hub/bem-estar-multissensorial/>
- Saúde na Última Semana: <https://lucashralmeida.github.io/via-hub/sarampo-alertas-2026/>

## Estrutura

- `index.html` — conteúdo e semântica da página.
- `styles.css` — sistema visual responsivo com a paleta institucional VIA.
- `app.js` — navegação móvel, filtros e renderização segura do portfólio.
- `projects.json` — fonte versionada das demonstrações e respectivos status.
- `.github/ISSUE_TEMPLATE/parceria.yml` — formulário para propostas institucionais.
- `mentoria-sincronismo-hibrido/` — landing pública da oferta de mentoria paga (calibração de juízo clínico).
- `via-mente-mbrp/index.html` — webapp psicoeducacional MBRP-8.
- `via-literacia-programacao-github/index.html` — trilha web introdutória com progresso local.
- `via-literacia-programacao-github/apostila.md` — fonte pedagógica versionada de programação, Git e GitHub.
- `via-literacia-programacao-github/README.md` — documentação editorial e técnica do módulo.
- `bem-estar-multissensorial/index.html` — guia multissensorial de bem-estar (música, cores e aromas).
- `bem-estar-multissensorial/README.md` — escopo, limitações e documentação do módulo.
- `soberania-informacional/index.html` — frente de proteção de dados, autonomia e direitos digitais.
- `soberania-informacional/README.md` — tese, escopo e limites editoriais do módulo.
- `soberania-informacional/docs/` — protocolo de evidência e modelo de representação administrativa calibrado.
- `sarampo-alertas-2026/index.html` — boletim de utilidade pública em saúde (sarampo e prevenção), alinhado à paleta VIA.
- `sarampo-alertas-2026/README.md` — escopo, limitações e documentação do módulo.
- `.nojekyll` — publicação direta dos arquivos estáticos pelo GitHub Pages.

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

**Dr Lucas HR - Médico Generalista (FMRP-USP)**  
CRM-SP: 226836 | CRM-MG: 109752  
**Iniciativa VIA - Vida Integrada e Autônoma**  
Ciência e Tecnologia a serviço do Cuidado.
