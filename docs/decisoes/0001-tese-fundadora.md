# ADR 0001 (Architecture Decision Record — Registro de Decisão de Arquitetura) — Tese fundadora da Iniciativa VIA

- Status: aceita
- Data: 2026-07-23
- Contexto: commit inaugural do via-hub (ddef64e)
- Autor: Dr Lucas HR

> Um ADR (Architecture Decision Record) é um registro curto, datado e versionado de uma decisão fundamental do projeto: preserva o que foi decidido, quando e por quê. Este é o primeiro (0001) — a decisão fundadora.

## Questão de projeto

Qual a essência primeira e o destino teleológico que se pode abstrair da corpora em deploy da Iniciativa VIA — isto é, o que este repositório está de fato fundando, para além da lista de arquivos e da retórica de cada módulo?

## Decisão

Adota-se, como espinha dorsal editorial de todo o ecossistema VIA, a seguinte leitura fundadora.

### Essência primeira

Debaixo dos módulos e dos avisos há um único gesto repetido: converter conhecimento em ferramenta verificável e autônoma. Cada artefato toma um corpo de saber — clínico, científico, jurídico, econômico — e o entrega ao sujeito como instrumento que roda nele: no navegador, sem servidor, sem login, sem extrair dados. A recusa em capturar o usuário não é detalhe técnico; é a tese materializada na arquitetura.

Três invariantes sustentam essa essência:

1. Separar a fonte da ferramenta. A evidência é versionada à parte da interface que a serve.
2. Declarar estágio, escopo e limites. Cada módulo diz o que faz e o que não faz; horizonte editorial não é anunciado como capacidade implementada.
3. Tratar software como argumento verificável, não como peça cenográfica.

### Destino teleológico

O VIA não é um portfólio, e sim a construção de uma infraestrutura de cuidado que devolve agência. O telos é o cidadão-paciente-aprendiz mais capaz de decidir por si; a régua final de cada ferramenta é a calibração do juízo de quem a usa, nunca a dependência de quem a construiu.

Em uma frase: transformar autoridade — clínica, científica, jurídica — em autonomia distribuída, e provar essa intenção na própria arquitetura que se recusa a capturar quem a usa.

## Consequência

- Todo novo módulo herda os três invariantes e declara seu próprio escopo e limites.
- A síntese acima pode servir de base ao README-manifesto da raiz e ao README de perfil.
- O processo dialógico que derivou esta decisão é andaime, não obra: preserva-se aqui a destilação, não o transcrito.

---

Iniciativa VIA — Vida Integrada e Autônoma
Ciência e Tecnologia a serviço do Cuidado.
