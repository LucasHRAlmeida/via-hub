# EVAM Conversor — V1.0

Conversor clínico estruturante do **VIA Federal Regulation Lab**. A V1.0 recebe narrativa clínica livre, sugere campos estruturados por heurísticas transparentes e produz:

- resumo regulatório em texto;
- envelope JSON com proveniência por campo;
- JSON Schema Draft 2020-12 específico do template selecionado;
- lista explícita de campos críticos ausentes.

## Posição na proposta federal

O EVAM ocupa a fronteira entre o texto clínico de origem e o **modelo clínico mínimo** descrito no plano canônico da equipe clínica. Ele não executa matching de destino nem infere prioridade. Sua função é tornar o episódio revisável e computável antes de qualquer motor de regras, incerteza ou aprendizado.

Fluxo previsto:

`narrativa livre → desidentificação → extração heurística → revisão humana → envelope versionado → motor de matching resolutivo`

## Templates V1.0

1. Sepse biliar / colangite — Emergência, Gastroenterologia e Cirurgia.
2. Síndrome coronariana aguda — Emergência, Cardiologia e Hemodinâmica.
3. AVC agudo — Emergência, Neurologia e Neurorradiologia intervencionista.
4. Politrauma — Emergência, Cirurgia do Trauma e Ortopedia.
5. Insuficiência respiratória aguda — Emergência, Pneumologia e Medicina Intensiva.
6. Emergência neurocirúrgica — Emergência, Neurocirurgia e Medicina Intensiva.

Os templates vivem em `schemas.js`, têm `id` e versão próprios e podem ser exportados pela interface como JSON Schema. Cada campo informa grupo, tipo, unidade e obrigatoriedade. A inclusão de nova síndrome exige revisão clínica do conjunto mínimo, das capacidades executoras e dos critérios de ausência crítica.

## Segurança e privacidade

- Execução 100% local no navegador; nenhuma chamada de rede no código do conversor.
- Sem `localStorage`, cookies, login ou persistência automática.
- A narrativa original só entra no JSON se o usuário marcar a opção correspondente.
- O redator cobre padrões óbvios de CPF, CNS, telefone e e-mail, mas **não garante anonimização**.
- A versão pública aceita somente casos sintéticos ou adequadamente desidentificados.
- Campos extraídos automaticamente exigem validação humana.

## Limites clínicos

O EVAM V1.0:

- não diagnostica;
- não calcula prioridade clínica;
- não recomenda destino;
- não substitui o médico regulador;
- não implementa FHIR normativo: o envelope é **FHIR-like**, preparado para posterior mapeamento formal à RNDS/HL7 FHIR;
- não foi validado retrospectiva ou prospectivamente.

## Desenvolvimento e teste

Não há build nem dependências externas. Abra `index.html` por servidor estático ou execute:

```bash
python -m http.server 8000
```

Na pasta deste módulo:

```bash
npm test
```

Os testes verificam desidentificação básica, extração do caso-âncora, declaração de incompletude, consistência dos templates e saída formatada.

## Proveniência desta implementação

Esta V1.0 é uma **reimplementação limpa** a partir do requisito funcional e da proposta canônica de regulação. O arquivo local de origem `evam-conversor.html`, citado por caminho `file://` no iOS, não estava acessível durante a implementação. Quando o original for anexado, ele deverá ser preservado em branch separada e comparado antes de qualquer incorporação.

---

**Dr Lucas HR Almeida — Médico Generalista (FMRP-USP)**  
CRM-SP 226836 | CRM-MG 109752

**Iniciativa VIA — Vida Integrada e Autônoma**  
Ciência e tecnologia a serviço do cuidado.

