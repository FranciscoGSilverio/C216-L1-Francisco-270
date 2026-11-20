# Spec 02 — Infraestrutura (Docker, Compose, Makefile e ambiente)

Status: **aprovada**

## Problema

A aplicação precisa subir inteira (banco, backend e frontend) com um comando, a partir
de um clone limpo, com as migrations aplicadas automaticamente e sem segredos no repositório.

## Escopo

Dockerfiles, `docker-compose.yml`, `Makefile` e `.env.example`. A execução é dividida em
duas etapas porque o frontend só existe depois da Spec 03:

- **Etapa A (agora):** `db` e `backend`, `.env.example`, Makefile (alvos de backend e Docker).
- **Etapa B (após a Spec 03):** Dockerfile do frontend, serviço `frontend` no Compose e
  alvos `frontend-*` do Makefile.

Não inclui o Compose isolado de E2E nem o CI (Spec 04).

## Serviços do Compose

| Serviço | Detalhes |
|---|---|
| `db` | `postgres:17`, `container_name: cinema-db`, volume nomeado `postgres_data`, healthcheck `pg_isready`, credenciais vindas do `.env` |
| `backend` | `cinema-backend`, imagem do `backend/Dockerfile`, depende do `db` saudável, porta `${BACKEND_PORT}:8000`, bind mount `./backend:/app`, healthcheck em `/status` |
| `frontend` (etapa B) | `cinema-frontend`, porta `${FRONTEND_PORT}:5173`, depende do `backend` saudável, healthcheck HTTP |

**Migrations automáticas:** o comando do `backend` é `alembic upgrade head` seguido de
`uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`. Subir os contêineres já cria
as tabelas, sem passo manual.

`DATABASE_URL` é montada no Compose a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD` e
`POSTGRES_DB`. `CORS_ORIGINS` vem do `.env`.

## Variáveis de ambiente (`.env.example`)

`POSTGRES_USER=cinema`, `POSTGRES_PASSWORD=change-me-local`, `POSTGRES_DB=cinema`,
`POSTGRES_PORT=5432`, `BACKEND_PORT=8000`, `FRONTEND_PORT=5173`,
`VITE_API_URL=http://localhost:8000`, `CORS_ORIGINS=http://localhost:5173`.

O arquivo funciona sem edição (`make env` copia para `.env`, que é ignorado pelo Git).
A senha de exemplo é um valor de desenvolvimento local, claramente marcado como tal.

## Makefile

Alvos: `help install test lint format run clean env up down build logs ps restart
backend-shell db-shell docker-test docker-clean db-upgrade db-downgrade db-current
db-history db-migration`. Os alvos nativos montam a `DATABASE_URL` com `localhost`
lendo o `.env`. Nenhuma senha literal no Makefile.

Na etapa B: `frontend-install frontend-check frontend-test frontend-build`.

## Critérios de aceite

- A partir de um clone limpo: `make env && make up` sobe `db` e `backend` `healthy`.
- `curl localhost:8000/status` responde `{"status":"online"}` e as tabelas existem no banco
  (migrations aplicadas pelo próprio `up`).
- Os dados persistem após `make down` e novo `make up` (volume nomeado).
- `make test` e `make lint` passam.
- Nenhum nome `c216` nem referência ao laboratório de items; nenhuma senha literal fora do `.env.example`.
- Etapa B: o mesmo, com o frontend `healthy` em `localhost:5173` falando com a API.

## Riscos

- O build da imagem pode falhar por instabilidade de rede (`poetry install`); repetir o build resolve.
- Um `.env` antigo no clone precisa das variáveis novas; `make env` não sobrescreve.

## Aprovação

Aprovado por: Francisco  Data: 19/11/2026

Observações do revisor: em 19/11/2026 o desenvolvedor autorizou parar os contêineres da Prática 7 (`c216-*`) e liberar as portas 5432, 8000 e 5173 para a validação da stack do projeto. Os contêineres foram apenas parados, sem remover volumes ou imagens.
