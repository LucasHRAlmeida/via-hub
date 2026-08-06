# Como publicar a raiz do domínio

Este diretório é o **conteúdo pronto** do repositório `LucasHRAlmeida.github.io`
(site de usuário do GitHub Pages). Ele não é servido a partir daqui — está
versionado neste repositório apenas para não se perder.

## Por que existe

Convenções da web — `robots.txt`, `ai.txt`, `/.well-known/` — só são lidas
automaticamente na **raiz do domínio**. Enquanto `lucashralmeida.github.io/`
respondia 404, todo o portfólio vivia em subcaminho e esses arquivos não
tinham efeito prático.

## Passos

1. Criar o repositório **público** `LucasHRAlmeida.github.io` (o nome deve ser
   exatamente igual ao usuário; é o que o GitHub Pages exige para site de raiz).
2. Copiar todo o conteúdo deste diretório para a raiz daquele repositório,
   incluindo os arquivos ocultos `.nojekyll` e `.well-known/`.
3. Em *Settings → Pages*, confirmar a publicação a partir da branch `main`.
4. Verificar: `https://lucashralmeida.github.io/` deve responder 200, e
   `https://lucashralmeida.github.io/robots.txt` também.

## Depois, o domínio próprio

Com a raiz existindo, apontar `iniciativa-via.com` deixa de transferir o
domínio para um não-site. No painel da Cloudflare:

1. **Remover o bloqueio que hoje devolve 403** ao domínio (desafio de bot /
   modo "Under Attack" / política de Access). Enquanto ele existir, nenhum
   rastreador indexa o domínio.
2. Registros de DNS apontando para o GitHub Pages:
   - `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - `CNAME` de `www` para `lucashralmeida.github.io`
   - Proxy em **DNS only** (nuvem cinza) até o certificado ser emitido.
3. Adicionar o arquivo `CNAME` (com `iniciativa-via.com`) na raiz do
   repositório de raiz, e habilitar *Enforce HTTPS* em Settings → Pages.
4. Só então migrar as URLs canônicas (canonical, og:url, `@id` do JSON-LD e
   sitemaps) para o novo domínio — em uma passada única, para não fragmentar
   a entidade.
