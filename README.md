# Iniciativa VIA — portal institucional

Portal público da **Iniciativa VIA — Vida Integrada e Autônoma**. O site organiza o portfólio de Dr Lucas HR em uma arquitetura institucional voltada a medicina, pesquisa, tecnologia, saúde pública e formação de parcerias.

## Acesso

GitHub Pages: <https://lucashralmeida.github.io/via-hub/>

## Estrutura

- `index.html` — conteúdo e semântica da página.
- `styles.css` — sistema visual responsivo com a paleta institucional VIA.
- `app.js` — navegação móvel, filtros e renderização segura do portfólio.
- `projects.json` — fonte versionada das demonstrações e respectivos status.
- `.github/ISSUE_TEMPLATE/parceria.yml` — formulário para propostas institucionais.
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
WhatsApp Business (Nexo-->me) : + 55 16 996180196
