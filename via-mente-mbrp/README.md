# VIA · MENTE — MBRP-8

Webapp psicoeducacional de oito semanas para organização de práticas de atenção plena e prevenção de recaída. Desenvolvido pela **VIA — Vida Integrada e Autônoma**, o módulo traduz a estrutura do *Mindfulness-Based Relapse Prevention* (MBRP) para um roteiro diário em português brasileiro.

> **Estado:** beta v0.1  
> **Acesso público:** <https://iniciativa-via.com/via-hub/via-mente-mbrp/>

## O que é

O VIA · MENTE propõe um percurso de 56 dias organizado em oito semanas:

1. perceber o piloto automático;
2. reconhecer desconforto e fissura;
3. praticar a pausa SOBER;
4. lidar com situações desafiadoras;
5. planejar contingência para lapsos;
6. trabalhar defusão de pensamentos;
7. sustentar bem-estar e autocompaixão;
8. consolidar rede de apoio e continuidade.

Cada semana articula prática formal, exercício de campo, registro breve e uma camada opcional de internalização. O módulo inclui:

- navegação por abas e semanas;
- rastreio diário de 56 dias;
- critério de progressão de `5/7` dias por semana;
- painel agregado de progresso;
- kit de bolso com SOBER, manejo breve de fissura e cartão de emergência;
- versão imprimível por navegador.

## Escopo clínico e evidencial

O núcleo do roteiro é derivado de **MBRP**. A aplicação não equivale a tratamento individual, grupo terapêutico, psicoterapia, avaliação médica ou plano de desintoxicação.

As técnicas apresentadas são distinguidas no próprio material por status de evidência:

- **Evidência A:** núcleo MBRP;
- **Evidência B:** análogos com suporte empírico, como intenções de implementação, prevenção de recaída, reestruturação cognitiva e defusão;
- **Evidência C:** recursos instrumentais/opcionais de evidência fraca.

A chamada “camada PNL” é usada apenas como recurso mnemônico e de adesão; não é apresentada como substituta do MBRP nem como sistema clinicamente validado.

### Situações que excedem o módulo

O conteúdo orienta busca de cuidado profissional e não deve ser usado para manejar autonomamente:

- abstinência de álcool ou benzodiazepínicos;
- intoxicação, convulsão, confusão ou alucinações;
- risco de autoagressão ou crise aguda;
- agravamento relevante de fissura, angústia ou sintomas psiquiátricos durante exercícios de visualização.

No Brasil, o material aponta **SAMU 192**, **CVV 188** e **CAPS-AD** como portas de apoio conforme a situação.

## Privacidade

O webapp é estático. O rastreio é salvo apenas no navegador/dispositivo por `localStorage`, nas chaves `viaMbrp.s1` a `viaMbrp.s8`.

- Não há formulário.
- Não há banco de dados.
- Não há transmissão de progresso a servidor pelo código do módulo.
- O botão **“Zerar todo o progresso”** remove esses registros locais.

Se o navegador bloquear armazenamento local, o aplicativo informa que o progresso vale apenas para a sessão.

## Estrutura técnica

```text
via-mente-mbrp/
├── index.html  # aplicação estática, estilos e scripts no mesmo arquivo
└── README.md   # escopo, evidência, privacidade e manutenção
```

O módulo não exige etapa de build nem dependências de execução. Para abrir localmente:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000/via-mente-mbrp/`.

A publicação é feita pelo **GitHub Pages** a partir do repositório `LucasHRAlmeida/via-hub`.

## Referência-base

Bowen, S.; Chawla, N.; Grow, J.; Marlatt, G. A. *Mindfulness-Based Relapse Prevention for Addictive Behaviors*. 2. ed. Guilford Press, 2021.

## Changelog

### v0.1

- publicação inicial do roteiro MBRP-8;
- navegação acessível por abas;
- registro local de adesão semanal;
- painel de progresso de 56 dias;
- kit de campo e orientações de contingência;
- classificação explícita da camada de evidência.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**  
CRM-SP 226.836 | CRM-MG 109.752  
**VIA — Vida Integrada e Autônoma**  
*Ciência a serviço do cuidado.*
