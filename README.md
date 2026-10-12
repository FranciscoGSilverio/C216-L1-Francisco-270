# C216-L1-Francisco-270

Repositório da disciplina C216 (Sistemas Distribuídos) — entregas práticas.

## Backend

A API é organizada em camadas:

```text
backend/src/app/
├── main.py           # inicialização da aplicação e registro dos routers
├── api/routes/        # endpoints HTTP (health, items)
├── schemas/            # modelos Pydantic (entrada/saída da API)
├── services/            # regras de negócio
├── repositories/         # acesso aos dados via SQLAlchemy
├── models/                # modelos ORM (SQLAlchemy)
├── database/               # engine, sessão e Base declarativa
└── core/                     # configuração (DATABASE_URL)
```

## Banco de dados

A persistência usa PostgreSQL via SQLAlchemy, com o schema versionado por
Alembic (`backend/alembic/`). A conexão é configurada pela variável de
ambiente `DATABASE_URL` (veja `.env.example`) — nunca hardcoded no código.

```bash
make up           # sobe backend + banco (cria o .env se necessário)
make db-upgrade    # aplica as migrations pendentes
```

Outros comandos úteis:

```bash
make db-migration msg="descrição da mudança"   # gera uma nova migration (autogenerate)
make db-current                                 # mostra a revisão atual do banco
make db-shell                                    # abre o psql no container do banco
```

Os comandos `make test`, `make run` e `make db-*` resolvem `DATABASE_URL`
automaticamente a partir do `.env` (apontando para `localhost`, já que
rodam fora do Docker); dentro dos containers (`make docker-test`,
`make up`) a aplicação usa o `DATABASE_URL` do próprio `.env` (apontando
para o serviço `db`).

## Testes

O backend usa [Pytest](https://docs.pytest.org/) para os testes automatizados, separados em unitários e de integração:

```text
backend/tests/
├── unit/          # testam a camada de serviço diretamente, sem HTTP
└── integration/   # testam os endpoints via TestClient
```

Os testes de `items` usam o PostgreSQL de verdade (nenhum dado é mantido em
memória): o banco precisa estar no ar antes de rodar a suíte.

```bash
make up        # sobe o PostgreSQL (e o backend)
make install   # instala as dependências via Poetry
make test      # executa a suíte de testes
```

Os testes também rodam automaticamente via GitHub Actions (`.github/workflows/ci.yml`) a cada `push` e `pull request`, com dois jobs em paralelo: `lint` (`ruff format --check` e `ruff check`) e `test` (sobe um serviço de PostgreSQL, aplica as migrations com `poetry run alembic upgrade head` e executa `poetry run pytest`).
