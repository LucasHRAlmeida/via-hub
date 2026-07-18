# VIA Literacia — Programação, Git e GitHub

Módulo educacional introdutório da Iniciativa VIA para pessoas sem experiência prévia em programação ou controle de versão.

## Acessos

- Aplicação web: <https://lucashralmeida.github.io/via-hub/via-literacia-programacao-github/>
- Apostila versionada: [`apostila.md`](./apostila.md)
- Portfólio VIA: <https://lucashralmeida.github.io/via-hub/>

## Proposta pedagógica

O conteúdo foi organizado como uma trilha de 4 a 6 horas, com uma única linguagem de entrada — Python — e ciclos curtos de objetivo, conceito, prática e verificação. A progressão termina em uma entrega observável: um programa simples documentado, versionado em uma branch e integrado por pull request.

Principais decisões da revisão:

- remove alternância precoce entre Python e JavaScript;
- apresenta entrada → processamento → saída antes da sintaxe;
- conecta conceitos de programação a um projeto cumulativo;
- introduz Git por seu modelo de estados, não por memorização de comandos;
- diferencia Git, GitHub, commit, branch, issue e pull request;
- atualiza autenticação HTTPS e práticas mínimas de proteção de credenciais;
- inclui critérios de conclusão, autoavaliação e respostas comentadas.

## Arquivos

```text
via-literacia-programacao-github/
├── index.html    # experiência web responsiva e autônoma
├── apostila.md   # fonte pedagógica versionada
└── README.md     # documentação do módulo
```

O `index.html` não depende de bibliotecas, fontes ou serviços externos. O progresso marcado pelo leitor é salvo apenas no navegador com `localStorage`; nenhum dado é enviado.

## Executar localmente

Na raiz de `via-hub`:

```bash
python -m http.server 8000
```

Abra:

```text
http://localhost:8000/via-literacia-programacao-github/
```

Também é possível abrir `index.html` diretamente, mas um servidor local reproduz melhor a publicação no GitHub Pages.

## Verificação editorial

Ao atualizar o módulo:

1. trate `apostila.md` como fonte conceitual;
2. replique mudanças relevantes na edição web;
3. execute todos os exemplos Python;
4. verifique navegação por teclado e layout em largura móvel;
5. confirme que nenhum token, e-mail pessoal ou dado sensível entrou no histórico;
6. atualize a versão e a data no Markdown e no HTML.

## Escopo

O módulo cobre fundamentos. Ambientes virtuais, dependências, testes com frameworks, GitHub Actions, rebase e estratégias avançadas de colaboração são próximos passos, não pré-requisitos.

---

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
