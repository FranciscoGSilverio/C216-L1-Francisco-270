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
└── core/                     # configuração (DATABASE_URL, CORS_ORIGINS)
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

## Frontend

Aplicação React (JavaScript, sem TypeScript) que permite listar, cadastrar,
editar e excluir itens (nome e descrição) consumindo a API do backend
(veja [Integração full-stack](#integração-full-stack)).

```text
frontend/src/
├── main.jsx              # ponto de entrada, renderiza <App />
├── App.jsx                # carrega os itens da API e coordena as ações
├── services/               # api.js (helper request) e items.js (um método por rota)
├── validation.js           # regra de validação (função pura)
├── index.css                 # @import "tailwindcss"
└── components/
    ├── ItemForm.jsx      # formulário (nome + descrição)
    ├── ItemList.jsx      # listagem e estado vazio
    └── ItemRow.jsx       # linha com edição inline e exclusão
```

Estilização com Tailwind CSS (via plugin do Vite, sem `tailwind.config.js`),
lint e formatação com [Biome](https://biomejs.dev/) (equivalente ao Ruff do
backend).

```bash
make frontend-install   # instala as dependências (npm ci)
make frontend-dev       # inicia o servidor de desenvolvimento (Vite)
make frontend-lint      # verifica o código
make frontend-format    # formata o código
```

### Testes do frontend

Os testes são organizados em três níveis:

```text
frontend/tests/
├── unit/          # Vitest + React Testing Library: funções e componentes isolados
├── integration/   # Vitest + RTL: App completo com `fetch` mockado
└── e2e/           # Playwright: navegador + frontend + API + banco reais
```

```bash
make frontend-test       # testes unitários e de integração (Vitest)
make frontend-build      # build de produção
make frontend-test-e2e   # Playwright contra uma stack já no ar (E2E_BASE_URL)
make e2e                 # sobe a stack isolada, roda o Playwright e derruba tudo
```

`make check-all` executa a suíte completa do backend (Ruff + Pytest), do
frontend (Biome, Vitest e build) e o `make e2e`.

Os testes do frontend também rodam via GitHub Actions
(`.github/workflows/ci-frontend.yml`), disparado em pull requests e em
pushes na `main` que alterem `frontend/**`, `backend/**`, o Compose ou o
Makefile: `npm ci`, lint, verificação de formatação, Vitest, build e o
`make e2e` (stack do Compose + Playwright com Chromium).

## Integração full-stack

Fluxo: **navegador (React, :5173) → API FastAPI (:8000) → PostgreSQL**. O
frontend chama a API por `fetch` (camada `frontend/src/services/`), o
backend persiste no banco e devolve JSON; a tela mostra "Carregando
itens..." enquanto lista e exibe a mensagem de erro quando a API falha.

```bash
make up          # sobe db, backend e frontend (cria o .env se necessário)
make ps          # db, backend e frontend devem ficar "healthy"
make db-upgrade  # aplica as migrations
make e2e         # E2E contra uma stack isolada (projeto lab-e2e)
make check-all   # lint, testes, build e E2E
```

Variáveis (veja `.env.example`):

| Variável | Uso |
| --- | --- |
| `CORS_ORIGINS` | Origens permitidas pelo CORS do backend, separadas por vírgula (padrão `http://localhost:5173`). O curinga `*` é recusado. |
| `FRONTEND_PORT` | Porta do frontend no host (padrão `5173`). |
| `VITE_API_URL` | URL da API vista pelo navegador (padrão `http://localhost:8000`). |

As rotas da API são chamadas **sem barra final** (`/items`): o FastAPI
redireciona `/items/` com 307, e esse redirecionamento quebra o CORS.

### Nome de item duplicado

O nome do item é único (comparação exata, diferenciando maiúsculas de
minúsculas): `POST`, `PUT` e `PATCH` com o nome de outro item respondem
`409` com `{"detail": "Já existe um item com esse nome"}`. A regra é garantida
também no banco pela constraint `uq_items_name`.

Se o banco já tiver nomes duplicados, `make db-upgrade` falha com um erro de
violação de unicidade (nada é alterado). Remova ou renomeie os duplicados e
rode a migration de novo:

```sql
-- lista os nomes repetidos
SELECT name, count(*) FROM items GROUP BY name HAVING count(*) > 1;
-- remove os repetidos, mantendo o de menor id
DELETE FROM items a USING items b WHERE a.name = b.name AND a.id > b.id;
```
