# FONTES_EDUCACAO_SAUDE — educação em saúde para leigos

## Finalidade

Este índice complementa `CURADORIA.md` e `SSOT_OPERACAO.md`.

Reúne fontes públicas, gratuitas e sem paywall para educação em saúde destinada a pessoas leigas, famílias e cuidadores.

Estas fontes não substituem diretrizes clínicas. Para afirmação biomédica, prevalece a hierarquia definida em `CURADORIA.md`.

## Regras de uso

- Usar apenas fontes com URL oficial verificada.
- Registrar `data_consulta` em cada citação ou recuperação de conteúdo.
- Não usar material educativo como fundamento primário de afirmação clínica.
- Priorizar conteúdo em português quando disponível e equivalente em qualidade.
- Para fontes internacionais, registrar idioma e contexto regulatório.
- Não apresentar fluxos, medicamentos ou direitos de saúde de outros países como válidos no Brasil sem verificação.
- Revalidar fonte sem consulta há mais de 12 meses.
- Mover para `fontes_aposentadas` qualquer fonte que passe a exigir login, assinatura ou paywall, registrando data e motivo.

## Hierarquia desta raia

1. **Prioridade em português**: Ministério da Saúde, OPAS/OMS Brasil, Fiocruz e Manual MSD Versão Saúde para a Família.
2. **Apoio internacional de alta qualidade**: MedlinePlus e NHS Health A to Z.
3. **Complemento internacional**: NIH, Mayo Clinic, Cleveland Clinic e Familydoctor.org.
4. **Uso secundário**: Patient.info.

## Fontes ativas

### 1. Manual MSD Versão Saúde para a Família

```yaml
fonte:
  entidade: "Manual MSD Versão Saúde para a Família"
  sigla: "MSD Família"
  nivel_raia: "prioridade_portugues"
  url_oficial: "https://www.msdmanuals.com/pt/casa"
  idioma: "pt-BR"
  acesso: "publico_gratuito"
  publico: "pacientes, famílias e cuidadores"
  exemplos:
    - titulo: "Tópicos de saúde"
      url: "https://www.msdmanuals.com/pt/casa/health-topics"
    - titulo: "Vida saudável"
      url: "https://www.msdmanuals.com/pt/casa/healthy-living"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "linguagem_acessivel_e_contexto_leigo"
  limite: "nao_substitui_diretriz_clinica"
```

### 2. Ministério da Saúde

```yaml
fonte:
  entidade: "Ministério da Saúde"
  sigla: "MS"
  nivel_raia: "prioridade_portugues"
  url_oficial: "https://www.gov.br/saude/pt-br"
  idioma: "pt-BR"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Campanhas da Saúde"
      url: "https://www.gov.br/saude/pt-br/campanhas-da-saude"
    - titulo: "Saúde de A a Z"
      url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "contexto_sus_campanhas_e_orientacao_oficial_brasileira"
```

### 3. OPAS/OMS Brasil

```yaml
fonte:
  entidade: "Organização Pan-Americana da Saúde / Organização Mundial da Saúde"
  sigla: "OPAS/OMS"
  nivel_raia: "prioridade_portugues"
  url_oficial: "https://www.paho.org/pt/brasil"
  idioma: "pt-BR"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Brasil — OPAS/OMS"
      url: "https://www.paho.org/pt/brasil"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "materiais_institucionais_em_portugues"
  pendencia: "verificar_urls_individuais_por_tema_antes_de_citacao"
```

### 4. Fiocruz

```yaml
fonte:
  entidade: "Fundação Oswaldo Cruz"
  sigla: "Fiocruz"
  nivel_raia: "prioridade_portugues"
  url_oficial: "https://fiocruz.br/"
  idioma: "pt-BR"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Publicações"
      url: "https://fiocruz.br/publicacoes"
    - titulo: "Acesso aberto"
      url: "https://fiocruz.br/acesso-aberto"
    - titulo: "Porto Livre"
      url: "https://portolivre.fiocruz.br/"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "saude_publica_sus_e_conhecimento_aberto"
```

### 5. MedlinePlus

```yaml
fonte:
  entidade: "MedlinePlus — National Library of Medicine / NIH"
  sigla: "MedlinePlus"
  nivel_raia: "apoio_internacional"
  url_oficial: "https://medlineplus.gov/"
  idioma: "en; es"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Health Topics"
      url: "https://medlineplus.gov/healthtopics.html"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "medicamentos_exames_enciclopedia_medica_e_topicos_de_saude"
  limite: "validar_contexto_brasileiro_antes_de_usar"
```

### 6. NHS Health A to Z

```yaml
fonte:
  entidade: "National Health Service — Inglaterra"
  sigla: "NHS"
  nivel_raia: "apoio_internacional"
  url_oficial: "https://www.nhs.uk/"
  idioma: "en-GB"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Health A to Z"
      url: "https://www.nhs.uk/health-a-to-z/"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "linguagem_clara_sinais_de_alerta_e_quando_procurar_atendimento"
  limite: "contexto_do_NHS_ingles_nao_equivalente_ao_SUS"
```

### 7. NIH Health Information

```yaml
fonte:
  entidade: "National Institutes of Health"
  sigla: "NIH"
  nivel_raia: "complemento_internacional"
  url_oficial: "https://www.nih.gov/health-information"
  idioma: "en"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Health Information"
      url: "https://www.nih.gov/health-information"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "temas_de_saude_e_pesquisa_clinica"
```

### 8. Mayo Clinic

```yaml
fonte:
  entidade: "Mayo Clinic"
  sigla: "Mayo Clinic"
  nivel_raia: "complemento_internacional"
  url_oficial: "https://www.mayoclinic.org/"
  idioma: "en"
  acesso: "publico_gratuito_para_leitura"
  exemplos:
    - titulo: "Diseases & Conditions"
      url: "https://www.mayoclinic.org/diseases-conditions"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "explicacao_de_doencas_e_sintomas"
  limite: "verificar_versao_em_portugues_antes_de_usar"
```

### 9. Cleveland Clinic Health Library

```yaml
fonte:
  entidade: "Cleveland Clinic"
  sigla: "Cleveland Clinic"
  nivel_raia: "complemento_internacional"
  url_oficial: "https://my.clevelandclinic.org/health"
  idioma: "en"
  acesso: "publico_gratuito_para_leitura"
  exemplos:
    - titulo: "Health Library"
      url: "https://my.clevelandclinic.org/health"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "material_educativo_complementar"
```

### 10. Familydoctor.org

```yaml
fonte:
  entidade: "American Academy of Family Physicians"
  sigla: "AAFP"
  nivel_raia: "complemento_internacional"
  url_oficial: "https://familydoctor.org/"
  idioma: "en; es"
  acesso: "publico_gratuito"
  exemplos:
    - titulo: "Familydoctor.org"
      url: "https://familydoctor.org/"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "educacao_em_atencao_primaria"
```

### 11. Patient.info

```yaml
fonte:
  entidade: "Patient.info"
  sigla: "Patient.info"
  nivel_raia: "uso_secundario"
  url_oficial: "https://patient.info/"
  idioma: "en"
  acesso: "publico_gratuito_para_leitura"
  exemplos:
    - titulo: "Health information"
      url: "https://patient.info/"
  data_consulta: "2026-10-10"
  status: "ativa"
  uso: "apoio_secundario"
  limite: "menor_hierarquia_institucional_que_NHS_e_NIH"
```

## Fontes aposentadas ou restritas

```yaml
fontes_aposentadas:
  - entidade: "Sociedade Brasileira de Patologia"
    sigla: "SBP-Patologia"
    observacao_sigla: "Usar 'SBP-Patologia' para evitar ambiguidade com a Sociedade Brasileira de Pediatria, também conhecida como SBP."
    motivo: "acesso_a_guidelines_exige_formulario_ou_identificacao"
    url: "https://www.sbp.org.br/guidelines/"
    data_consulta: "2026-10-10"
    status: "nao_elegivel_como_fonte_aberta"
```

## Registro de citação

```yaml
citacao:
  entidade: "Manual MSD Versão Saúde para a Família"
  titulo: "Tópicos de saúde"
  url: "https://www.msdmanuals.com/pt/casa/health-topics"
  idioma: "pt-BR"
  data_consulta: "2026-10-10"
  tipo_uso: "educacao_leiga"
```
