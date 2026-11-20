.PHONY: help install test lint format run clean \
        env up down build logs ps restart backend-shell db-shell docker-test docker-clean \
        test-db db-upgrade db-downgrade db-current db-history db-migration \
        frontend-install frontend-dev frontend-lint frontend-format frontend-check \
        frontend-test frontend-build e2e check-all

BACKEND_DIR := backend
POETRY := cd $(BACKEND_DIR) && poetry
PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff
ALEMBIC := $(POETRY) run alembic
NPM := npm --prefix frontend
COMPOSE := docker compose
# Stack isolada do E2E: projeto próprio, portas próprias e senha do banco
# aleatória a cada execução. Não depende do .env nem toca a stack normal.
E2E_COMPOSE := docker compose -p cinema-e2e -f docker-compose.yml -f docker-compose.e2e.yml

# Comandos nativos (fora do Docker) falam com o PostgreSQL do Compose via
# localhost, lendo as credenciais do .env. Nada de senha escrita neste arquivo.
DB_USER := $(shell grep -E '^POSTGRES_USER=' .env 2>/dev/null | cut -d= -f2)
DB_PASSWORD := $(shell grep -E '^POSTGRES_PASSWORD=' .env 2>/dev/null | cut -d= -f2)
DB_NAME := $(shell grep -E '^POSTGRES_DB=' .env 2>/dev/null | cut -d= -f2)
DB_PORT := $(shell grep -E '^POSTGRES_PORT=' .env 2>/dev/null | cut -d= -f2)
DATABASE_URL_LOCAL := postgresql+psycopg://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)
# Os testes usam um banco próprio para não apagar os dados da aplicação.
TEST_DATABASE_URL_LOCAL := $(DATABASE_URL_LOCAL)_test

help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  Local:"
	@echo "    make install        - instala dependências do backend"
	@echo "    make test           - executa os testes (banco de teste separado)"
	@echo "    make lint           - verifica o código (Ruff)"
	@echo "    make format         - formata o código (Ruff)"
	@echo "    make run            - inicia a API fora do Docker"
	@echo "    make clean          - remove arquivos temporários"
	@echo ""
	@echo "  Docker:"
	@echo "    make env            - cria o .env a partir do .env.example"
	@echo "    make up             - sobe os containers em background"
	@echo "    make down           - para e remove os containers (mantém os dados)"
	@echo "    make build          - reconstrói as imagens"
	@echo "    make logs           - acompanha os logs dos containers"
	@echo "    make ps             - lista os containers e seu status"
	@echo "    make restart        - reinicia os containers"
	@echo "    make backend-shell  - abre um shell no container do backend"
	@echo "    make db-shell       - abre o psql no container do banco"
	@echo "    make docker-test    - executa os testes dentro do container"
	@echo "    make docker-clean   - remove containers, volumes e imagens"
	@echo ""
	@echo "  Banco de dados:"
	@echo "    make db-upgrade             - aplica as migrations pendentes"
	@echo "    make db-downgrade           - desfaz a última migration"
	@echo "    make db-current             - mostra a revisão atual"
	@echo "    make db-history             - lista as migrations"
	@echo "    make db-migration msg=\"...\" - cria uma migration (autogenerate)"
	@echo ""
	@echo "  Frontend:"
	@echo "    make frontend-install - instala as dependências (npm ci)"
	@echo "    make frontend-dev     - inicia o servidor de desenvolvimento (Vite)"
	@echo "    make frontend-lint    - verifica o código (Biome)"
	@echo "    make frontend-format  - formata o código (Biome)"
	@echo "    make frontend-check   - lint + formatação sem alterar arquivos"
	@echo "    make frontend-test    - executa os testes (Vitest)"
	@echo "    make frontend-build   - build de produção"
	@echo "    make e2e              - sobe uma stack isolada, roda o Playwright e derruba tudo"
	@echo ""
	@echo "  make check-all - lint, testes do backend e do frontend, build e E2E"

install:
	$(POETRY) install

# Cria o banco de testes se ainda não existir (o Compose precisa estar no ar).
test-db:
	@$(COMPOSE) exec -T db psql -U $(DB_USER) -d $(DB_NAME) -tc \
		"SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)_test'" | grep -q 1 \
		|| $(COMPOSE) exec -T db psql -U $(DB_USER) -d $(DB_NAME) -c 'CREATE DATABASE "$(DB_NAME)_test"'

test: test-db
	export DATABASE_URL=$(TEST_DATABASE_URL_LOCAL); $(PYTEST)

lint:
	$(RUFF) check .
	$(RUFF) format --check .

format:
	$(RUFF) format .

run:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(UVICORN) app.main:app --reload --app-dir src

clean:
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -prune -exec rm -rf {} +

env:
	@test -f .env || (cp .env.example .env && echo ".env criado a partir do .env.example")

up: env
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

build: env
	$(COMPOSE) build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

restart:
	$(COMPOSE) restart

backend-shell:
	$(COMPOSE) exec backend bash

db-shell:
	$(COMPOSE) exec db psql -U $(DB_USER) -d $(DB_NAME)

# O cache do Pytest vai para /tmp para não criar arquivos do root na árvore
# local, já que o código entra no container por bind mount.
docker-test: test-db
	$(COMPOSE) exec -e PYTEST_ADDOPTS="-o cache_dir=/tmp/pytest_cache" backend sh -c 'DATABASE_URL=$$TEST_DATABASE_URL pytest'

docker-clean:
	$(COMPOSE) down -v --rmi local

db-upgrade:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) upgrade head

db-downgrade:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) downgrade -1

db-current:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) current

db-history:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) history

db-migration:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) revision --autogenerate -m "$(msg)"

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-check:
	$(NPM) run check

frontend-test:
	$(NPM) run test

frontend-build:
	$(NPM) run build

# Sobe a stack isolada, roda o Playwright e SEMPRE derruba tudo (inclusive
# volumes), saindo com o status do Playwright. As migrations rodam no `up`.
e2e:
	@export POSTGRES_USER=cinema POSTGRES_PASSWORD=$$(openssl rand -hex 16) POSTGRES_DB=cinema \
		POSTGRES_PORT=15432 BACKEND_PORT=18000 FRONTEND_PORT=15173 \
		VITE_API_URL=http://localhost:18000 CORS_ORIGINS=http://localhost:15173; \
	$(E2E_COMPOSE) up -d --build --wait \
		&& E2E_BASE_URL=http://localhost:15173 $(NPM) run test:e2e; \
	status=$$?; \
	$(E2E_COMPOSE) down -v --remove-orphans; \
	exit $$status

check-all: lint test frontend-check frontend-test frontend-build e2e
