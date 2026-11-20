# Cinema — catálogo de filmes e atores

Projeto Final da disciplina C216 (Sistemas Distribuídos), semestre 2026.2.

> ### 🎬 [Assista ao vídeo demonstrativo](https://www.youtube.com/watch?v=5IvwunH7SAM)
> Apresentação do projeto, arquitetura, execução com Docker Compose, demonstração e testes.

## Objetivo e tema

Aplicação web full-stack para manter um catálogo de cinema: cadastrar **filmes** e **atores**
e montar o **elenco** de cada filme, informando o personagem que cada ator interpreta. A
relação entre filmes e atores é N:N e vive no banco de dados, com o personagem guardado no
próprio vínculo.

## Funcionalidades

- **Atores:** cadastrar, listar, buscar por nome, editar e excluir (nome, data de nascimento e nacionalidade).
- **Filmes:** cadastrar, listar, buscar por título, editar e excluir (título, ano, gênero e sinopse).
- **Elenco:** vincular atores a um filme com o personagem, editar o personagem, remover o vínculo e consultar o filme com o seu elenco. Um ator pode estar em vários filmes e um filme pode ter vários atores.
- **Interface:** rotas próprias por tela, mensagens de carregamento, sucesso e erro, validação dos campos após o blur e modal de confirmação antes de qualquer exclusão.

### Regras de negócio e respostas da API

| Regra | Resposta |
|---|---|
| Nome do ator é único | `409` "Já existe um ator com esse nome" |
| Título + ano do filme são únicos (o mesmo título pode ter anos diferentes) | `409` "Já existe um filme com esse título e ano" |
| Um ator entra uma única vez no elenco de um filme | `409` "Este ator já está no elenco deste filme" |
| Ator, filme ou vínculo inexistente | `404` "Ator não encontrado", "Filme não encontrado" ou "Vínculo não encontrado" |
| Ano do filme entre 1888 e o ano atual + 5; nascimento do ator não pode ser futuro; personagem obrigatório | `422` |
| Excluir um filme ou um ator remove só os vínculos (cascata no banco), nunca o outro lado | `204` |

A existência do recurso é verificada antes da checagem de duplicidade (404 antes de 409).

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/status` | Healthcheck |
| GET, POST | `/actors` | Lista (`?name=`) e cadastra |
| GET, PUT, DELETE | `/actors/{id}` | Consulta, atualiza e exclui |
| GET, POST | `/movies` | Lista (`?title=`, `?actor_id=`) e cadastra |
| GET, PUT, DELETE | `/movies/{id}` | Consulta (com `cast`), atualiza e exclui |
| POST | `/movies/{movie_id}/cast` | Vincula um ator (`actor_id`, `character`) |
| PUT, DELETE | `/movies/{movie_id}/cast/{actor_id}` | Altera o personagem e remove o vínculo |

A documentação interativa fica em `http://localhost:8000/docs`.

## Tecnologias

- **Backend:** Python, FastAPI, SQLAlchemy 2, Alembic, Pydantic, Poetry, Ruff, Pytest.
- **Banco:** PostgreSQL 17.
- **Frontend:** React 19 (JavaScript), Vite, Tailwind CSS 4, React Router, Yup, Biome, Vitest e Testing Library.
- **Testes de ponta a ponta:** Playwright.
- **Infraestrutura:** Docker, Docker Compose, Make e GitHub Actions.

## Estrutura do repositório

```
backend/
  src/app/
    api/routes/       rotas HTTP (actors, movies, cast, health)
    services/         regras de negócio e erros de domínio
    repositories/     acesso ao banco
    schemas/          validação e serialização (Pydantic)
    models/           tabelas (SQLAlchemy)
    core/, database/  configuração e sessão
  alembic/versions/   migrations versionadas
  tests/              unit/ e integration/
frontend/
  src/pages/          uma página por rota
  src/components/     formulários, elenco, modal e layout
  src/services/       acesso à API
  src/validation/     schemas Yup e hook do formulário
  tests/              unit/, integration/ e e2e/
docs/                 specs aprovadas e documentação do uso de IA
.github/workflows/    CI do backend e do frontend
docker-compose.yml    banco, backend e frontend
docker-compose.e2e.yml  nomes da stack isolada do E2E
Makefile              comandos de execução, testes e migrations
```

### Modelo de dados

```
actors                 movie_actors                  movies
------                 ------------                  ------
id (PK)                movie_id (PK, FK -> movies)   id (PK)
name (único)           actor_id (PK, FK -> actors)   title
birth_date             character                     year
nationality                                          genre
                       ON DELETE CASCADE nas duas    synopsis
                       chaves estrangeiras           (título + ano são únicos)
```

## Pré-requisitos

- Docker com Docker Compose v2 e Make (suficientes para subir e usar a aplicação).
- Para os comandos nativos: Python 3.10+ e Poetry (backend) e Node 22 com npm (frontend).
- Para `make e2e`: `openssl` e o Chromium do Playwright (`cd frontend && npx playwright install chromium`).

## Variáveis de ambiente

`make env` cria o `.env` a partir do `.env.example`; os valores de exemplo funcionam sem edição.

| Variável | Padrão | Uso |
|---|---|---|
| `POSTGRES_USER` | `cinema` | Usuário do banco |
| `POSTGRES_PASSWORD` | `change-me-local` | Senha do banco (valor de desenvolvimento local; troque se expuser o banco) |
| `POSTGRES_DB` | `cinema` | Nome do banco |
| `POSTGRES_PORT` | `5432` | Porta do banco no host |
| `BACKEND_PORT` | `8000` | Porta da API no host |
| `FRONTEND_PORT` | `5173` | Porta da interface no host |
| `VITE_API_URL` | `http://localhost:8000` | URL da API vista pelo navegador |
| `CORS_ORIGINS` | `http://localhost:5173` | Origens permitidas (lista separada por vírgula; `*` é recusado) |

A `DATABASE_URL` é montada pelo Compose a partir das variáveis `POSTGRES_*`. Os testes usam um
banco separado (`<POSTGRES_DB>_test`), então não apagam os dados da aplicação.

## Como executar

```bash
make env     # cria o .env a partir do .env.example
make up      # constrói as imagens e sobe banco, backend e frontend
make ps      # os três serviços devem ficar "healthy"
```

Depois, acesse:

- Interface: `http://localhost:5173`
- API: `http://localhost:8000` (documentação em `/docs`)

Para parar: `make down` (mantém os dados). Para apagar também os dados e as imagens: `make docker-clean`.

> Se for usar os comandos nativos do frontend (`make frontend-check`, `make frontend-test`),
> rode `make frontend-install` **antes** de `make up`. Se o Docker subir primeiro, ele cria
> `frontend/node_modules` com dono `root` e o `npm ci` do host falha por permissão.

Outros comandos úteis: `make logs`, `make restart`, `make backend-shell`, `make db-shell`. O
`make help` lista todos.

## Migrações

As migrations rodam **automaticamente** quando o backend sobe (`alembic upgrade head` antes do
servidor), então `make up` já deixa o banco pronto. Comandos manuais (precisam do banco no ar e
de `make install`):

```bash
make db-upgrade                     # aplica as migrations pendentes
make db-current                     # mostra a revisão atual
make db-history                     # lista as migrations
make db-downgrade                   # desfaz a última
make db-migration msg="descrição"   # gera uma nova migration a partir dos models
```

## Testes

```bash
make install            # dependências do backend (uma vez)
make frontend-install   # dependências do frontend (uma vez)

make test               # backend: Pytest (unidade e integração), com o banco do Compose no ar
make docker-test        # os mesmos testes dentro do contêiner
make lint               # backend: Ruff (lint e formatação)
make frontend-check     # frontend: Biome (lint e formatação)
make frontend-test      # frontend: Vitest e Testing Library
make frontend-build     # frontend: build de produção
make e2e                # Playwright contra uma stack isolada, derrubada ao final
make check-all          # tudo acima, exceto docker-test
```

O `make e2e` sobe uma stack própria (projeto `cinema-e2e`, portas 15432, 18000 e 15173, senha de
banco aleatória a cada execução), roda o fluxo completo no navegador, incluindo a persistência após
recarregar a página, e sempre derruba a stack, mesmo se um teste falhar.

## Integração contínua

Dois workflows do GitHub Actions rodam em todo push e pull request:

- **CI:** Ruff (lint e formatação) e Pytest com PostgreSQL, além de `alembic upgrade head` e `alembic check`.
- **CI - Frontend:** Biome, Vitest, build e Playwright (`make e2e`).

## Uso de agentes de programação

Agentes de programação foram usados para escrever o código de forma mecânica, **sob curadoria do
desenvolvedor**: cada bloco do projeto teve uma especificação em [`docs/specs/`](docs/specs/),
aprovada por escrito antes da implementação, e cada bloco foi revisado antes de seguir. As decisões de
domínio, a revisão, as correções e a verificação são do desenvolvedor. O processo está descrito em
[`docs/uso-de-ia.md`](docs/uso-de-ia.md).

## Vídeo demonstrativo

### 🎬 [Assistir ao vídeo demonstrativo no YouTube](https://www.youtube.com/watch?v=5IvwunH7SAM)
