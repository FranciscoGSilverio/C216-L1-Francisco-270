# Spec 03 — Frontend (interface de filmes, atores e elenco)

Status: **aprovada**

## Problema

O usuário precisa operar a aplicação pelo navegador: cadastrar, consultar, editar e
excluir atores e filmes, e montar o elenco de cada filme com o personagem de cada ator.

## Escopo

Frontend React (JavaScript) falando com a API da Spec 01. Não inclui o Dockerfile do
frontend (etapa B da Spec 02) nem o E2E (Spec 04).

## Tecnologias

Versões atuais na instalação, travadas pelo `package-lock.json`.

| Uso | Biblioteca |
|---|---|
| UI | React 19 + `react-dom` |
| Build e dev server | Vite com `@vitejs/plugin-react` |
| Estilo | Tailwind CSS 4 com `@tailwindcss/vite` |
| Rotas | `react-router-dom` |
| Validação | `yup` |
| Ícones | `lucide-react` (lixeira, lápis, busca, adicionar) |
| Lint e formatação | Biome |
| Testes | Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` |

Sem biblioteca de formulários, de componentes de UI ou de estado global: formulários usam
`useState` e o `yup`. O modal de confirmação é um componente próprio (`role="dialog"`).

## Rotas

Cada recurso tem páginas próprias, cada página com o seu estado. Os formulários de ator e de
filme são componentes separados, sem abstração genérica compartilhada entre as duas entidades.

| Rota | Página |
|---|---|
| `/` | redireciona para `/filmes` |
| `/filmes` | lista de filmes com busca por título |
| `/filmes/novo` | cadastro de filme |
| `/filmes/:id` | detalhe do filme com o painel de elenco |
| `/filmes/:id/editar` | edição de filme |
| `/atores` | lista de atores com busca por nome |
| `/atores/novo` | cadastro de ator |
| `/atores/:id/editar` | edição de ator |
| qualquer outra | página "Página não encontrada" com link para `/filmes` |

Barra de navegação fixa com os links Filmes e Atores. Nas listas, o botão "Novo" leva à rota
de cadastro. Após salvar, volta para a lista (ou o detalhe, no caso de filme) com mensagem de sucesso.

## Elenco

Na página `/filmes/:id`: lista do elenco (ator e personagem), formulário "Adicionar ao elenco"
(seletor de atores que omite quem já está no elenco, mais o campo personagem), edição do
personagem e remoção do vínculo. Sem atores cadastrados, mostra um aviso com link para `/atores/novo`.

## Validação (yup)

Schemas por entidade em `src/validation/` (`actorSchema`, `movieSchema`, `castSchema`),
com as mesmas regras do backend e mensagens em português: nome e título obrigatórios
(1 a 150 e 1 a 200 caracteres), ano inteiro entre 1888 e o ano atual + 5, nascimento
não futuro, nacionalidade até 80, gênero até 60, sinopse até 2000, personagem obrigatório
(até 150) e ator obrigatório no vínculo.

- A mensagem de cada campo aparece **depois do blur** desse campo (`validateAt`); campo que o
  usuário não tocou não mostra erro.
- No envio, todos os campos são validados e os erros aparecem; com erro, nada é enviado.
- O backend continua sendo a autoridade; seus erros (409, 404, 422) aparecem em um aviso e o
  formulário preserva o que foi digitado.

## Camada de serviços

`request(path, options)` e `ApiError` centralizam o `fetch`: API inacessível vira
"Não foi possível conectar à API."; resposta não 2xx usa o `detail` da API (string) ou
"Erro {status} ao acessar a API."; 204 devolve `null`. A URL base vem de `VITE_API_URL`.
Serviços: `actors` (`listActors`, `getActor`, `createActor`, `replaceActor`, `deleteActor`),
`movies` (`listMovies`, `getMovie`, `createMovie`, `replaceMovie`, `deleteMovie`) e
`cast` (`addCastMember`, `updateCastMember`, `removeCastMember`). Buscas codificadas na URL;
rotas da API chamadas **sem barra final**.

## Exclusão

Toda exclusão (ator, filme e vínculo do elenco) usa um botão com **ícone de lixeira**
(`aria-label` descritivo) que abre um **modal de confirmação** ("Excluir X? Esta ação não
pode ser desfeita.", botões Cancelar e Excluir). Só a confirmação chama a API. O mesmo
componente `ConfirmDialog` atende os três casos.

## Estados

Todas as páginas têm **carregamento** ("Carregando ..."), **sucesso** (mensagem após cada
operação) e **erro** (mensagem da API ou de conexão). Listas vazias: "Nenhum ator cadastrado."
e "Nenhum filme cadastrado.".

## Estilo

Simples, focado no funcional: fundo azul claro fosco (`bg-blue-100`, sem gradientes), conteúdo
em cartões brancos (`bg-white`, cantos arredondados, sombra leve), botões e campos brancos ou
neutros, uma cor de destaque azul para ações principais e vermelho só na exclusão. Interface
em português; identificadores no código em inglês.

## Testes

Vitest + Testing Library com `fetch` mockado e rotas em `MemoryRouter`: serviços (um teste por
função e os três cenários de erro do `request`); schemas yup (casos de borda: ano 1887, nome
só com espaços, nascimento futuro); formulários (erro aparece só após o blur, envio bloqueado
com erro, erro 409 preserva o texto); `ConfirmDialog` (Cancelar não chama a API, Excluir chama);
páginas de lista, cadastro, edição e detalhe com elenco (vínculo, seletor sem atores já
vinculados, edição do personagem, remoção); rota inexistente.

## Critérios de aceite

- `npm ci`, `make frontend-check` (Biome), `make frontend-test` (Vitest) e `make frontend-build` passam.
- Contra a API real: criar dois atores, criar um filme, vincular os dois com personagens,
  consultar o filme com o elenco, editar e excluir (sempre via modal); os dados persistem
  após recarregar a página, inclusive em uma rota profunda como `/filmes/1`.
- Nenhum texto do laboratório de items permanece.

## Fora do escopo

Autenticação, paginação, E2E (Spec 04), tema escuro e animações.

## Aprovação

Aprovado por: Francisco  Data: 19/11/2026

Observações do revisor:

- 19/11/2026 — correção solicitada pelo desenvolvedor após a revisão do frontend: campos obrigatórios
  (nome do ator; título e ano do filme; ator e personagem no elenco) exibem um asterisco
  vermelho no rótulo, desenhado por CSS para não alterar o nome acessível, com `aria-required`
  no campo e a nota "Campos marcados com * são obrigatórios." nos formulários.
- 19/11/2026 — revisão do frontend concluída e aprovada em 19/11/2026.
