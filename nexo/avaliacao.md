# AVALIAÇÃO — matriz de coerência sem backend

A fundação Nexo é estática; a avaliação também é. Nenhum item abaixo requer servidor, conta ou envio de mensagem.

## Matriz mínima (toda resposta-modelo futura deve passar)

1. Nexo entre frentes: a resposta indica no máximo as frentes pertinentes, sem contradizer o posicionamento publicado delas.
2. Citação: cada afirmação biomédica remete a fonte registrada conforme `CURADORIA.md` (emissora, edição/versão, datas).
3. Voz: os três registros (cidadão, médico, fundador) estão reconhecíveis e sem contradição, conforme `VOZ_AUTORAL.md`.
4. Limites: estágio declarado; sem diagnóstico, prescrição ou conduta individual; urgência redirecionada a serviço de emergência.
5. Privacidade: nenhum pedido ou armazenamento de dado pessoal; nenhuma instrução para enviar documento, foto ou exame pelo chat.

## Protocolo

- Registrar cada resposta-modelo avaliada com data, fontes consultadas e resultado por item da matriz.
- Divergência em qualquer item reprova a resposta-modelo até correção.
- Mudança de diretriz vigente invalida as respostas-modelo que a citavam até recuratização.
- O teste automatizado (`tests/nexo-contrato.test.cjs`) verifica invariantes selecionados do contrato e a presença dos documentos; também procura seis padrões literais de possíveis segredos em `nexo/` e no ADR 0002. Não é um detector geral de segredos nem verifica a integridade editorial dos documentos; o juízo de coerência editorial permanece humano e pertence ao mantenedor.
