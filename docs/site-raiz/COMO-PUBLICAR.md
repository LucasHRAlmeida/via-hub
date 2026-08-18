# Como publicar a raiz do domínio

Este diretório é o **conteúdo pronto** do repositório `LucasHRAlmeida.github.io`
(site de usuário do GitHub Pages). Ele não é servido a partir daqui — está
versionado neste repositório apenas para não se perder.

## Por que existe

Convenções da web — `robots.txt`, `ai.txt`, `/.well-known/` — só são lidas
automaticamente na **raiz do domínio**. Enquanto a raiz respondia 404, todo o
portfólio vivia em subcaminho e esses arquivos não tinham efeito prático.

## Passos executados

1. Repositório **público** `LucasHRAlmeida.github.io` criado (o nome precisa ser
   exatamente igual ao usuário; é o que o GitHub Pages exige para site de raiz).
2. Conteúdo deste diretório copiado para a raiz daquele repositório,
   incluindo os arquivos ocultos `.nojekyll` e `.well-known/`.
3. Publicação a partir da branch `main` confirmada em *Settings → Pages*.

## Domínio próprio — concluído

Com a raiz publicada, `iniciativa-via.com` foi apontado ao GitHub Pages. O que
foi feito, no painel da Cloudflare e no repositório de raiz:

1. **Removido o bloqueio que devolvia 403** ao domínio (desafio de bot / modo
   "Under Attack" / política de Access), que impedia qualquer rastreador de
   indexá-lo.
2. Registros de DNS apontando para o GitHub Pages:
   - `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
   - `CNAME` de `www` para `lucashralmeida.github.io` (host do GitHub Pages;
     é o alvo do registro, não uma URL canônica do site)
   - Proxy em **DNS only** (nuvem cinza) até o certificado ser emitido.
3. Arquivo `CNAME` (com `iniciativa-via.com`) adicionado à raiz do repositório
   de raiz e *Enforce HTTPS* habilitado em Settings → Pages.
4. URLs canônicas (canonical, og:url, `@id` do JSON-LD e sitemaps) migradas
   para o novo domínio em uma passada única, para não fragmentar a entidade.

## Estado verificado

`https://iniciativa-via.com/` e `https://iniciativa-via.com/via-hub/` respondem
200, com HTTPS ativo e certificado emitido.
