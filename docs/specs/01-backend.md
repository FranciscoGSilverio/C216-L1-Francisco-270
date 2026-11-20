# Spec 01 — Backend (API de filmes e atores)

Status: **aprovada**

## Problema

O projeto precisa de uma API REST que gerencie filmes e atores e permita vincular
atores a filmes com o personagem interpretado (relação N:N com dado próprio).

## Escopo

Backend em FastAPI com camadas `routes → services → repositories → models/schemas`,
PostgreSQL, SQLAlchemy 2 e Alembic. Não inclui frontend, Docker do frontend, E2E nem CI.

## Modelo de dados

| Tabela | Colunas e restrições |
|---|---|
| `actors` | `id` PK; `name` 1–150, único (`uq_actors_name`); `birth_date` opcional, não pode ser futura; `nationality` opcional, até 80 |
| `movies` | `id` PK; `title` 1–200; `year` entre 1888 e ano atual + 5; `genre` opcional até 60; `synopsis` opcional até 2000; único `(title, year)` (`uq_movies_title_year`) |
| `movie_actors` | `movie_id` e `actor_id` formam a PK composta; `character` 1–150, obrigatório; FKs com `ON DELETE CASCADE` |

Uma migration Alembic por tabela, versionada.

## API

- `/actors`: `GET` (filtro `?name=`), `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`.
- `/movies`: `GET` (filtros `?title=` e `?actor_id=`), `POST`, `GET /{id}` (inclui `cast`), `PUT /{id}`, `DELETE /{id}`.
- `POST /movies/{movie_id}/cast`, `PUT` e `DELETE /movies/{movie_id}/cast/{actor_id}`.
- `GET /status` retorna `{"status": "online"}`.
- Rotas sem barra final (um redirect 307 quebra o CORS).

## Regras e erros

| Situação | Resposta |
|---|---|
| Filme, ator ou vínculo inexistente | 404: "Filme não encontrado", "Ator não encontrado", "Vínculo não encontrado" |
| Ator com nome repetido | 409: "Já existe um ator com esse nome" |
| Filme com título e ano repetidos | 409: "Já existe um filme com esse título e ano" |
| Ator já no elenco do filme | 409: "Este ator já está no elenco deste filme" |
| Dados inválidos | 422 (Pydantic) |

A existência do recurso é verificada antes da checagem de duplicidade (404 antes de 409).
Excluir filme ou ator remove apenas os vínculos (cascata no banco).

CORS: origens explícitas via `CORS_ORIGINS`; `*` é recusado; métodos `GET, POST, PUT, DELETE, OPTIONS`.

## Critérios de aceite

- Testes de unidade (regras dos serviços) e de integração (endpoints, com PostgreSQL real) passam com `pytest`.
- `ruff check` e `ruff format --check` limpos.
- `alembic upgrade head` e `downgrade base` funcionam.
- Nenhuma senha literal no repositório.

## Decisões fora do escopo desta spec

Infraestrutura de contêineres e Makefile (Spec 02), frontend (Spec 03), E2E e CI (Spec 04).

## Aprovação

Aprovado por: Francisco  Data: 19/11/2026

Observações do revisor: revisão do backend concluída e aprovada em 19/11/2026.
