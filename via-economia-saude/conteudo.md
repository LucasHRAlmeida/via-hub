# VIA Economia & Saúde

## Inteligência econômica aplicada a profissionais da saúde

- **Versão:** MVP 0.1
- **Atualização:** 23 de julho de 2026
- **Público:** médicos e outros profissionais de saúde em diferentes momentos de carreira
- **Formato:** diagnóstico, microtrilha, simuladores, casos e plano de ação

## Propósito

Ajudar o profissional de saúde a transformar números dispersos em perguntas melhores:

- O caixa mensal está gerando folga ou consumindo reserva?
- O valor cobrado cobre custos e remunera o trabalho pretendido?
- Quantos atendimentos sustentam a operação?
- A reserva disponível é compatível com a instabilidade da renda?

O app não promete responder decisões tributárias, jurídicas ou de investimento. Ele organiza premissas e oferece estimativas para apoiar uma conversa qualificada com contador, planejador financeiro ou outro profissional habilitado.

## Arquitetura pedagógica

Cada núcleo segue quatro movimentos:

1. **Ver:** identificar os números essenciais.
2. **Calcular:** explicitar fórmula e premissas.
3. **Interpretar:** distinguir resultado de decisão.
4. **Agir:** escolher uma pequena ação verificável.

## Diagnóstico inicial

Quatro perguntas orientam a porta de entrada:

1. momento profissional;
2. grau de visibilidade sobre receitas e despesas;
3. decisão mais urgente;
4. variabilidade percebida da renda.

O diagnóstico não define perfil de investidor nem produz aconselhamento. Apenas recomenda por qual núcleo começar.

## Núcleo 1 — Caixa legível

### Conceitos

- receita recebida não é lucro;
- competência e caixa respondem a perguntas diferentes;
- um cenário realizado não deve ser misturado a um cenário projetado;
- separar pessoal e profissional melhora a qualidade da decisão;
- saldo final = saldo inicial + todas as entradas − todos os pagamentos.

### Simulador

Entradas:

- saldo disponível no início do mês;
- recebimentos operacionais efetivamente recebidos;
- aportes, empréstimos e outras entradas não operacionais;
- custos fixos e variáveis pagos;
- tributos e taxas pagos;
- dívidas, investimentos, remuneração e outras saídas pagas.

Saídas:

- geração operacional simplificada;
- total de pagamentos;
- movimento líquido do mês;
- saldo final.

### Limite

O app não calcula tributos. O campo tributário é um valor informado pelo usuário. Empréstimos e aportes entram no caixa, mas não são receita operacional. Fluxo de caixa não substitui uma DRE por competência.

## Núcleo 2 — Preço e ponto de equilíbrio

### Conceitos

- custo variável unitário: cresce com cada atendimento;
- contribuição unitária = valor recebido × (1 − deduções percentuais) − custo variável unitário;
- margem de contribuição = contribuição unitária ÷ valor recebido;
- ponto de equilíbrio operacional em atendimentos = custos fixos ÷ contribuição unitária;
- valor bruto de referência = [custo variável unitário + (custos fixos + remuneração-alvo + provisões) ÷ atendimentos esperados] ÷ (1 − deduções percentuais).

### Simulador

Entradas:

- custos fixos mensais;
- valor médio efetivamente recebido por atendimento pago;
- custo variável por atendimento;
- tributos, retenções, taxas e comissões percentuais;
- atendimentos pagos esperados;
- remuneração mensal que o cenário precisa cobrir;
- provisões e reinvestimento.

Saídas:

- valor bruto de referência;
- contribuição e margem de contribuição;
- atendimentos para equilíbrio operacional;
- resultado do cenário informado.

### Limite

O valor é uma decisão contratual e estratégica. A estimativa não é uma recomendação de honorário e não incorpora glosas, inadimplência, sazonalidade, regras de convênios, capacidade real, restrições éticas ou regulatórias. Percentuais tributários devem ser confirmados com contador.

## Núcleo 3 — Reserva e resiliência

### Conceitos

- reserva pessoal e continuidade da prática são problemas relacionados, mas diferentes;
- o período necessário depende da estabilidade e da composição da renda;
- liquidez e baixo risco são características importantes para reservas de emergência.

### Simulador

Entradas:

- despesas pessoais essenciais mensais;
- custos profissionais inevitáveis durante uma interrupção;
- meses de cobertura escolhidos;
- reserva líquida realmente destinada a emergências;
- aporte mensal possível.

Saídas:

- meta de cobertura;
- cobertura atual em meses;
- diferença para a meta;
- percentual já constituído;
- prazo simplificado, quando houver aporte.

### Referência

A CVM apresenta uma faixa educacional de 6 a 12 meses de gastos para reserva de emergência, ressaltando que o valor exato depende da estabilidade da renda e das circunstâncias individuais. O prazo simplificado do app ignora rendimento, inflação, retiradas e aportes extraordinários.

## Casos de aplicação

### Caso A — transição após a formação

Um médico recém-formado combina plantões de valores e datas variáveis. A primeira ação não é escolher um investimento: é mapear datas de recebimento, despesas essenciais, tributos provisionados e meses com menor escala.

### Caso B — consultório em expansão

Uma profissional considera comprar equipamento. Antes de financiar, separa o custo fixo atual, o custo variável por procedimento, o volume adicional plausível e o ponto de equilíbrio do novo cenário.

### Caso C — renda estável, pouca visibilidade

Um profissional tem boa renda, mas mistura despesas pessoais e profissionais. A prioridade é construir um fluxo mensal legível antes de otimizar carteira ou tributos.

## Plano de ação

- separar registros pessoais e profissionais;
- registrar as datas reais de entrada e saída;
- identificar custos fixos e variáveis;
- revisar o preço com premissas documentadas;
- definir uma meta de reserva;
- agendar revisão mensal;
- levar dúvidas tributárias e contratuais a profissionais habilitados.

## Fontes primárias e institucionais

- [Banco Central — Calculadora do Cidadão](https://www.bcb.gov.br/acessoinformacao/calculadoradocidadao)
- [Portal do Investidor/CVM — Planejamento financeiro](https://www.gov.br/investidor/pt-br/educacional/publicacoes-educacionais/guias/guia-de-planejamento-financeiro/guia-planejamento-financeiro.pdf)
- [Portal do Investidor/CVM — Emergências e aposentadoria](https://www.gov.br/investidor/pt-br/investir/antes-de-investir/defina-seus-objetivos/emergencias-e-aposentadoria)
- [Sebrae — Ponto de equilíbrio](https://digital.pi.sebrae.com.br/estudos-de-mercado/como-calcular-o-ponto-de-equilibrio)
- [Sebrae — Fluxo de caixa](https://sebrae.com.br/empreendedores/conteudos/gerenciar/fluxo-de-caixa--ferramenta-simples-para-controlar-entradas-e-sai)
- [Conselho Federal de Medicina — Código de Ética Médica](https://portal.cfm.org.br/images/PDF/cem2019.pdf)

## Horizonte editorial

Os dez temas da proposta original permanecem como mapa de expansão:

1. conjuntura econômica;
2. formação de preços;
3. DRE e fluxo de caixa;
4. custos e ponto de equilíbrio;
5. organização tributária;
6. reservas e investimentos;
7. adoção de tecnologia;
8. comportamento financeiro;
9. ferramentas digitais;
10. implementação e casos.

Novos módulos devem entrar apenas quando tiverem fonte versionada, exercício verificável, limite declarado e regra de atualização.

## Aviso

Conteúdo exclusivamente educacional. As simulações usam informações fornecidas pelo usuário e produzem aproximações. Não constituem recomendação de investimento, consultoria financeira, contábil, fiscal ou jurídica.

Não insira nomes, CPF/CNPJ, dados de pacientes ou informações clínicas. Limite de crédito não é reserva; empréstimo não é receita.

---

**Dr Lucas HR — Médico Generalista (FMRP-USP)**

CRM-SP: 226836 | CRM-MG: 109752

[WhatsApp Business: +55 16 99618-0196](https://wa.me/5516996180196)

**Iniciativa VIA — Vida Integrada e Autônoma**

Ciência e Tecnologia a serviço do Cuidado.
