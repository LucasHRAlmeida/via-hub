# Introdução prática à programação, Git e GitHub

> Uma trilha curta para transformar uma ideia em um pequeno programa Python, registrar sua evolução com Git e compartilhá-la no GitHub.

- **Versão:** 1.0
- **Atualização:** 18 de julho de 2026
- **Público:** pessoas sem experiência prévia ou no início da aprendizagem
- **Carga sugerida:** 4 a 6 horas, divididas em duas ou três sessões
- **Projeto final:** calculadora de média publicada em um repositório com branch e pull request

---

## Como usar esta apostila

Esta não é uma lista de termos para decorar. Em cada módulo você seguirá o mesmo ciclo:

1. **Entender** uma ideia essencial.
2. **Executar** um exemplo curto.
3. **Modificar** o exemplo para testar sua compreensão.
4. **Verificar** o resultado antes de avançar.

Digite os comandos e o código em vez de apenas copiá-los. Errar, ler a mensagem e corrigir faz parte da aprendizagem.

### Ao final, você será capaz de

- explicar algoritmo, variável, condição, repetição e função;
- executar e modificar um programa Python simples;
- interpretar mensagens de erro básicas;
- distinguir pasta, repositório, commit, branch e remoto;
- registrar mudanças com `git add` e `git commit`;
- publicar uma branch e abrir um pull request no GitHub;
- adotar cuidados mínimos com credenciais e informações sensíveis.

### Mapa da trilha

| Etapa | Entrega observável | Tempo sugerido |
|---|---|---:|
| 0. Preparar | ferramentas instaladas e pasta criada | 20 min |
| 1. Pensar como programa | algoritmo descrito em passos | 25 min |
| 2. Construir com Python | programa que recebe e transforma dados | 70 min |
| 3. Depurar | erro reproduzido, lido e corrigido | 25 min |
| 4. Versionar com Git | histórico com pelo menos dois commits | 45 min |
| 5. Colaborar no GitHub | branch remota e pull request | 50 min |
| 6. Integrar com segurança | conflito simples resolvido e checklist aplicado | 35 min |
| Projeto final | repositório documentado e verificável | 60–90 min |

---

## 0. Preparar o ambiente

### Objetivo

Confirmar que Python e Git estão acessíveis no terminal e criar uma pasta de trabalho.

### Ferramentas

- **Python 3:** executa os exemplos desta apostila.
- **Git:** registra o histórico dos arquivos.
- **Editor de texto:** VS Code, outra IDE ou editor de sua preferência.
- **Conta no GitHub:** necessária a partir do módulo 5.

No terminal, verifique as instalações:

```bash
python --version
git --version
```

Em alguns sistemas, o comando do Python é `python3`:

```bash
python3 --version
```

Crie a pasta do projeto e entre nela:

```bash
mkdir projeto-media
cd projeto-media
```

> **Terminal não é o Git.** O terminal recebe comandos; Git e Python são programas chamados por ele. `cd` muda de pasta, enquanto `git status` consulta um repositório.

### Verificação

Você consegue responder “sim” às três perguntas?

- O terminal mostrou uma versão do Python?
- O terminal mostrou uma versão do Git?
- O comando `cd` levou você para a pasta `projeto-media`?

Se alguma resposta for “não”, resolva a instalação antes de seguir. Os módulos seguintes dependem desse ambiente.

---

## 1. Pensar como um programa

### Objetivo

Decompor um problema em entradas, transformação e saída.

### 1.1 Programa, algoritmo e linguagem

- **Programa** é um conjunto de instruções executáveis por um computador.
- **Algoritmo** é uma sequência finita e ordenada de passos para alcançar um resultado.
- **Linguagem de programação** oferece vocabulário e regras — a sintaxe — para expressar esses passos.

Antes de escrever código, descreva o problema:

```text
Problema: calcular a média de três notas.
Entrada: três números.
Transformação: somar os números e dividir a soma por três.
Saída: exibir a média.
```

Essa estrutura forma um modelo útil:

```text
entrada → processamento → saída
```

### 1.2 Sequência, decisão e repetição

Quase todo programa combina três formas de fluxo:

- **sequência:** executar instruções em ordem;
- **decisão:** escolher um caminho conforme uma condição;
- **repetição:** executar um bloco mais de uma vez.

Exemplo em pseudocódigo:

```text
receber notas
se não houver notas:
    informar que faltam dados
senão:
    para cada nota:
        somar nota ao total
    dividir total pela quantidade de notas
    mostrar média
```

### Prática de recuperação

Sem consultar o texto, escreva em linguagem comum um algoritmo para:

1. receber a idade de uma pessoa;
2. informar se ela tem 18 anos ou mais.

Depois identifique: qual é a entrada, qual é a decisão e qual é a saída?

### Verificação

Você está pronto para avançar se consegue explicar por que um algoritmo pode ser escrito antes da escolha de uma linguagem.

---

## 2. Construir com Python

### Objetivo

Usar variáveis, tipos, condições, repetições e funções em um programa pequeno.

### 2.1 Primeira execução

Crie o arquivo `programa.py`:

```python
nome = input("Como você se chama? ")
print(f"Olá, {nome}!")
```

Execute:

```bash
python programa.py
```

O programa recebe texto com `input`, guarda o valor na variável `nome` e produz uma saída com `print`.

### 2.2 Variáveis e tipos

Uma variável associa um nome a um valor:

```python
nome = "Ana"          # str: texto
idade = 24            # int: número inteiro
altura = 1.68         # float: número decimal
estuda_python = True  # bool: verdadeiro ou falso
notas = [8.0, 7.5]    # list: coleção ordenada
```

Python determina o tipo a partir do valor. Ainda assim, operações precisam ser compatíveis:

```python
idade_texto = input("Idade: ")  # input sempre devolve texto
idade = int(idade_texto)         # conversão explícita para inteiro
print(idade + 1)
```

### 2.3 Operadores e condições

```python
media = 7.5

if media >= 7:
    print("Aprovado")
else:
    print("Em recuperação")
```

Operadores frequentes:

| Grupo | Operadores | Exemplo |
|---|---|---|
| aritméticos | `+`, `-`, `*`, `/`, `**` | `2 ** 3` resulta em `8` |
| comparação | `==`, `!=`, `>`, `<`, `>=`, `<=` | `idade >= 18` |
| lógicos | `and`, `or`, `not` | `idade >= 18 and ativo` |

> `=` atribui um valor. `==` compara dois valores. Confundir os dois é um erro comum no início.

### 2.4 Listas e repetição

```python
notas = [8.0, 6.5, 9.0]
total = 0

for nota in notas:
    total = total + nota

media = total / len(notas)
print(media)
```

O `for` visita cada item. `len(notas)` informa quantos itens a lista contém.

### 2.5 Funções

Funções dão nome a uma tarefa e evitam repetição:

```python
def calcular_media(notas):
    if not notas:
        return 0
    return sum(notas) / len(notas)


resultado = calcular_media([8.0, 6.5, 9.0])
print(f"Média: {resultado:.1f}")
```

- `notas` é um **parâmetro**;
- `[8.0, 6.5, 9.0]` é o **argumento** usado na chamada;
- `return` devolve o resultado;
- `:.1f` exibe o número com uma casa decimal.

### Prática guiada: calculadora de média

Substitua o conteúdo de `programa.py`:

```python
def calcular_media(notas):
    if not notas:
        return 0
    return sum(notas) / len(notas)


entrada = input("Digite as notas separadas por espaço: ")
notas = [float(item) for item in entrada.split()]
media = calcular_media(notas)
print(f"Média: {media:.1f}")
```

Teste pelo menos três casos:

```text
8 7 9
10
5.5 6.5
```

### Desafio de modificação

Acrescente uma decisão que mostre:

- `Situação: aprovado` quando a média for maior ou igual a 7;
- `Situação: revisar conteúdo` nos demais casos.

### Verificação

Antes de seguir, explique com suas palavras:

1. Por que os valores de `input` precisam ser convertidos com `float`?
2. O que acontece se a lista estiver vazia?
3. Qual vantagem a função `calcular_media` oferece?

---

## 3. Ler erros e testar hipóteses

### Objetivo

Usar a mensagem de erro como informação para localizar e corrigir um problema.

### 3.1 Três categorias úteis

- **Erro de sintaxe:** o código não segue as regras da linguagem.
- **Erro de execução:** a sintaxe é válida, mas algo falha durante a execução.
- **Erro de lógica:** o programa executa, porém produz resultado incorreto.

Execute de propósito:

```python
numero = float("oito")
```

Você verá um `ValueError`. Leia a última linha primeiro: ela informa o tipo e resume a causa. Depois observe o arquivo e a linha indicados acima.

### 3.2 Tratamento básico

Proteja a conversão da entrada:

```python
try:
    entrada = input("Digite as notas separadas por espaço: ")
    notas = [float(item) for item in entrada.split()]
except ValueError:
    print("Use apenas números separados por espaço.")
```

Use `try/except` quando você sabe qual falha pode ocorrer e consegue oferecer uma resposta útil. Não use `except` genérico apenas para esconder erros.

### 3.3 Teste simples

Inclua verificações temporárias ou automatizadas:

```python
assert calcular_media([6, 8]) == 7
assert calcular_media([]) == 0
```

Se uma afirmação for falsa, Python interrompe a execução com `AssertionError`.

### Rotina de depuração

1. Reproduza o erro.
2. Leia a última linha da mensagem.
3. Localize o primeiro trecho do seu código citado.
4. Formule uma hipótese pequena.
5. Altere uma coisa por vez.
6. Execute novamente e teste também um caso que já funcionava.

### Verificação

Faça o programa receber `8 sete 9`, observe o erro e implemente uma mensagem compreensível sem exibir o traceback para o usuário final.

---

## 4. Registrar a evolução com Git

### Objetivo

Criar um repositório local e produzir um histórico legível de mudanças.

### 4.1 Modelo mental

Git acompanha estados dos arquivos em três áreas:

```text
pasta de trabalho → área de preparação (stage) → histórico
       editar              git add             git commit
```

- **Repositório:** projeto mais a pasta oculta `.git`, que guarda o histórico.
- **Commit:** registro identificado de um conjunto coerente de mudanças.
- **Branch:** referência móvel para uma linha de desenvolvimento.
- **Remoto:** outro repositório associado ao local, frequentemente no GitHub.

### 4.2 Configuração inicial

Configure sua identidade uma vez no computador:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"
```

Confira:

```bash
git config --global --list
```

Use um e-mail que você controla. O GitHub permite um endereço `noreply` para preservar privacidade.

### 4.3 Primeiro commit

Dentro de `projeto-media`:

```bash
git init -b main
git status
git add programa.py
git status
git commit -m "Cria calculadora de média"
git log --oneline
```

Observe `git status` antes e depois de `git add`. Esse hábito evita commits acidentais.

Crie `README.md`:

````markdown
# Calculadora de média

Programa introdutório em Python que calcula a média de notas.

## Executar

```bash
python programa.py
```
````

Registre a documentação em um commit separado:

```bash
git add README.md
git diff --staged
git commit -m "Documenta como executar o programa"
```

### O que torna um commit útil?

Um bom commit:

- representa uma mudança coerente;
- deixa o projeto funcionando quando possível;
- tem uma mensagem curta no imperativo: “Adiciona”, “Corrige”, “Documenta”;
- não inclui senhas, tokens, chaves ou dados pessoais desnecessários.

### Verificação

```bash
git status
git log --oneline --graph --decorate
```

O resultado esperado é uma pasta sem mudanças pendentes e pelo menos dois commits.

---

## 5. Publicar e colaborar no GitHub

### Objetivo

Conectar o repositório local ao GitHub, trabalhar em uma branch e abrir um pull request.

### 5.1 Git e GitHub não são a mesma coisa

- **Git** funciona localmente e registra versões.
- **GitHub** hospeda repositórios Git e adiciona colaboração: pull requests, issues, revisões, Actions e Pages.

Você pode usar Git sem GitHub. O GitHub, por sua vez, usa o modelo de histórico do Git.

### 5.2 Criar o remoto

No GitHub, crie um repositório vazio chamado `projeto-media`. Como o projeto local já tem README e commits, não peça ao GitHub para inicializá-lo com arquivos.

Conecte e publique:

```bash
git remote add origin https://github.com/SEU-USUARIO/projeto-media.git
git remote -v
git push -u origin main
```

`-u` associa sua branch local à remota. Nos próximos envios, `git push` será suficiente.

### 5.3 Trabalhar em uma branch

```bash
git switch -c feat/classificacao
```

Implemente a classificação de aprovado/revisar conteúdo. Depois:

```bash
git status
git diff
git add programa.py
git commit -m "Adiciona classificação pela média"
git push -u origin feat/classificacao
```

### 5.4 Abrir um pull request

No GitHub, abra um pull request de `feat/classificacao` para `main`. Uma descrição curta deve responder:

```markdown
## Objetivo
Mostrar uma orientação após o cálculo da média.

## Mudanças
- adiciona classificação para médias maiores ou iguais a 7;
- mantém o cálculo existente.

## Como verifiquei
- [x] média 8 mostra "aprovado";
- [x] média 6 mostra "revisar conteúdo";
- [x] entrada inválida continua tratada.
```

Revise os arquivos alterados antes de concluir o merge. Depois, atualize a branch local:

```bash
git switch main
git pull --ff-only origin main
```

### Issue, pull request e commit

| Objeto | Pergunta que responde |
|---|---|
| issue | “Qual problema ou tarefa precisa de atenção?” |
| commit | “Qual mudança coerente foi registrada?” |
| pull request | “Esta sequência de mudanças deve entrar na branch principal?” |

### Verificação

Seu GitHub mostra a branch, o pull request e os commits? Outra pessoa conseguiria entender como testar a mudança apenas pela descrição?

---

## 6. Conflitos, autenticação e segurança

### Objetivo

Resolver um conflito simples e trabalhar sem expor credenciais.

### 6.1 Por que conflitos acontecem?

Um conflito ocorre quando Git não consegue combinar automaticamente mudanças concorrentes. Isso é comum quando duas branches alteram a mesma região de um arquivo.

As marcações têm esta forma:

<pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
conteúdo da branch atual
&#61;&#61;&#61;&#61;&#61;&#61;&#61;
conteúdo da outra branch
&gt;&gt;&gt;&gt;&gt;&gt;&gt; outra-branch</code></pre>

Para resolver:

1. leia as duas propostas;
2. edite o arquivo para manter o resultado correto;
3. remova **todas** as marcações;
4. execute o programa;
5. prepare e registre a resolução.

```bash
git add programa.py
git commit -m "Resolve conflito na mensagem de resultado"
```

Não escolha um lado sem entender o comportamento esperado.

### 6.2 Autenticação atual no GitHub

Para operações Git via HTTPS, autenticação por senha foi removida. Para iniciantes, prefira uma destas opções:

1. **GitHub CLI**, com autenticação pelo navegador: `gh auth login`;
2. **Git Credential Manager**, que armazena a credencial de forma integrada ao sistema;
3. **token de acesso pessoal** apenas quando necessário, com prazo e permissões mínimas.

O token deve ser tratado como uma senha: não o coloque no código, no README, em capturas de tela ou em commits. Se uma credencial for publicada, revogue-a imediatamente; apagar apenas o arquivo no commit mais recente não remove o segredo do histórico.

### 6.3 Proteção da conta e do projeto

- ative autenticação de dois fatores, preferindo aplicativo TOTP e uma chave de acesso ou chave de segurança como alternativa;
- guarde os códigos de recuperação fora do computador de uso diário;
- não versione arquivos `.env` com segredos;
- revise `git diff --staged` antes do commit;
- use proteção de branch e revisão obrigatória em projetos de equipe;
- dê a tokens e Actions somente as permissões necessárias.

Exemplo de `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

### Verificação

Antes de publicar, execute:

```bash
git status
git diff --staged
git remote -v
```

Confirme que não há credenciais, dados pessoais desnecessários nem arquivos gerados por engano.

---

## 7. Projeto final — calculadora de média versionada

### Desafio

Construa e publique um programa que:

- receba números separados por espaço;
- informe uma mensagem clara para entrada inválida;
- calcule a média, inclusive para uma lista vazia;
- classifique o resultado usando um limite documentado;
- tenha ao menos dois testes com `assert` ou `unittest`;
- inclua um README com objetivo, requisitos, execução e exemplos;
- seja desenvolvido em uma branch e integrado por pull request.

### Estrutura sugerida

```text
projeto-media/
├── .gitignore
├── README.md
├── programa.py
└── test_programa.py
```

### Critérios de conclusão

| Critério | Evidência |
|---|---|
| funciona | três entradas válidas e uma inválida verificadas |
| é legível | nomes claros e função com uma responsabilidade |
| é testável | cálculo separado da entrada/saída |
| é versionado | commits pequenos e mensagens descritivas |
| é reproduzível | README permite executar sem explicação oral |
| é colaborável | PR descreve mudança e verificação |
| é seguro | nenhum segredo ou dado sensível no histórico |

### Sequência recomendada de commits

```text
Cria função de cálculo da média
Adiciona leitura e validação da entrada
Adiciona classificação do resultado
Adiciona testes da regra de média
Documenta instalação e uso
```

### Autoavaliação

Sem consultar a apostila, você consegue:

1. desenhar o fluxo pasta → stage → commit?
2. explicar a diferença entre `git pull` e `git push`?
3. criar uma branch sem alterar `main`?
4. localizar a linha relevante de um erro Python?
5. mostrar onde outra pessoa encontra as instruções de execução?

Se alguma resposta for “ainda não”, retorne ao módulo correspondente e repita somente a prática de verificação.

---

## 8. Respostas comentadas

<details>
<summary>Desafio do módulo 2</summary>

```python
if media >= 7:
    print("Situação: aprovado")
else:
    print("Situação: revisar conteúdo")
```

A condição produz um booleano. Apenas um dos blocos é executado.

</details>

<details>
<summary>Versão integrada com tratamento de entrada</summary>

```python
def calcular_media(notas):
    if not notas:
        return 0
    return sum(notas) / len(notas)


def classificar(media, limite=7):
    return "aprovado" if media >= limite else "revisar conteúdo"


try:
    entrada = input("Digite as notas separadas por espaço: ")
    notas = [float(item) for item in entrada.split()]
    media = calcular_media(notas)
    print(f"Média: {media:.1f}")
    print(f"Situação: {classificar(media)}")
except ValueError:
    print("Entrada inválida. Use apenas números separados por espaço.")
```

Separar `calcular_media` e `classificar` facilita o teste das regras sem simular teclado e tela.

</details>

<details>
<summary>Testes mínimos</summary>

```python
from programa import calcular_media, classificar


assert calcular_media([6, 8]) == 7
assert calcular_media([]) == 0
assert classificar(7) == "aprovado"
assert classificar(6.9) == "revisar conteúdo"
```

</details>

---

## 9. Folha de consulta rápida

### Python

```python
texto = input("Texto: ")
numero = float(texto)
itens = [1, 2, 3]

if numero >= 0:
    print("não negativo")
else:
    print("negativo")

for item in itens:
    print(item)

def dobro(valor):
    return valor * 2
```

### Git local

```bash
git init -b main
git status
git diff
git add arquivo.py
git diff --staged
git commit -m "Descreve a mudança"
git log --oneline --graph --decorate
git switch -c feat/minha-tarefa
git switch main
git merge nome-da-branch
```

### Git remoto

```bash
git clone URL
git remote -v
git pull --ff-only origin main
git push -u origin nome-da-branch
git fetch origin
```

### Comandos de inspeção antes de comandos de alteração

```bash
git status
git diff
git log --oneline
git branch -vv
```

---

## 10. Glossário essencial

- **algoritmo:** sequência definida de passos para resolver um problema;
- **argumento:** valor fornecido ao chamar uma função;
- **branch:** referência para uma linha de desenvolvimento;
- **clone:** cópia local de um repositório remoto;
- **commit:** registro versionado de mudanças preparadas;
- **conflito:** combinação que exige decisão humana;
- **fork:** cópia de um repositório para outra conta no GitHub;
- **função:** bloco nomeado e reutilizável de comportamento;
- **merge:** integração de histórias de branches;
- **parâmetro:** nome que recebe um valor dentro de uma função;
- **pull request:** proposta revisável de integração de mudanças;
- **repositório:** arquivos do projeto e seu histórico Git;
- **stage:** seleção do que entrará no próximo commit;
- **variável:** nome associado a um valor.

---

## 11. Recursos confiáveis

- [Pro Git em português](https://git-scm.com/book/pt-br/v2) — fundamentos e referência do Git.
- [Documentação do GitHub](https://docs.github.com/pt) — repositórios, pull requests, autenticação e segurança.
- [Autenticação no GitHub](https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/about-authentication-to-github) — opções atuais para navegador e linha de comando.
- [Configuração de 2FA](https://docs.github.com/pt/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) — fatores e recuperação da conta.
- [Tutorial oficial do Python](https://docs.python.org/pt-br/3/tutorial/) — aprofundamento na linguagem; ele pressupõe alguma familiaridade prévia com programação.

---

## Nota pedagógica e de escopo

O material original foi reorganizado para reduzir alternância entre linguagens e aproximar cada conceito de uma ação observável. Python é usado como linguagem de entrada; JavaScript, GitHub Actions, rebase e estratégias avançadas de merge ficam para uma etapa posterior. Essa escolha não reduz a importância desses temas: apenas preserva uma progressão compatível com iniciantes.

Esta apostila introduz prática técnica, não substitui políticas de segurança, revisão de código ou treinamento específico exigido por uma organização.
