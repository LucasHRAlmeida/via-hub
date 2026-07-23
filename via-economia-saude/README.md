# VIA Economia & Saúde

Webapp educacional da **Iniciativa VIA — Vida Integrada e Autônoma** para apoiar profissionais de saúde na leitura do próprio contexto econômico e financeiro.

## Acesso

- Aplicação: <https://lucashralmeida.github.io/via-hub/via-economia-saude/>
- Fonte editorial: [`conteudo.md`](./conteudo.md)
- Portal VIA: <https://lucashralmeida.github.io/via-hub/>

## Proposta do MVP

O material original apresentava dez módulos de economia, gestão e finanças. Esta versão os reorganiza em uma primeira experiência verificável:

1. diagnóstico de prioridade;
2. trilha de três núcleos: caixa, preço/ponto de equilíbrio e reserva;
3. simuladores locais com premissas explícitas;
4. casos de aplicação;
5. plano de ação exportável.

Os demais temas — macroeconomia, tributos, investimentos, tecnologia e finanças comportamentais — permanecem como horizonte editorial, mas não são apresentados como capacidades já implementadas.

## Privacidade

- não há login;
- nenhum valor digitado é enviado a servidor;
- os cálculos são executados no navegador;
- apenas o progresso e o checklist do plano são guardados em `localStorage`;
- o usuário pode apagar esses registros pelo botão **Limpar dados locais**.

## Escopo e limites

Os resultados são estimativas educacionais. Não constituem recomendação de investimento, consultoria financeira, contábil, fiscal ou jurídica. Premissas tributárias e contratuais devem ser confirmadas com profissionais habilitados.

## Arquivos

```text
via-economia-saude/
├── index.html   # aplicação autônoma
├── conteudo.md  # fonte editorial e pedagógica
├── og.png       # cartão social do módulo
└── README.md    # documentação do módulo
```

## Executar localmente

Na raiz do VIA Hub:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000/via-economia-saude/`.

## Verificação editorial

Ao atualizar:

1. revise primeiro `conteudo.md`;
2. replique a mudança no app;
3. teste valores iguais a zero, campos vazios e preços abaixo do custo variável;
4. confirme que os links oficiais permanecem válidos;
5. mantenha o aviso de escopo visível;
6. atualize versão e data.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 16 99618-0196](https://wa.me/5516996180196)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
