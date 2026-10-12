.PHONY: help install test lint format run clean \
        env up down build logs ps restart backend-shell db-shell docker-test docker-clean \
        db-upgrade db-migration db-current

BACKEND_DIR := backend
POETRY := cd $(BACKEND_DIR) && poetry
PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff
ALEMBIC := $(POETRY) run alembic
COMPOSE := docker compose

# DATABASE_URL para comandos nativos (fora do Docker): aponta para o
# PostgreSQL do Compose via localhost, lendo as credenciais do .env — o
# mesmo padrão já usado pelo db-shell. Dentro dos containers (docker-test,
# docker compose up) a URL correta (host "db") já vem do próprio .env via
# env_file.
DB_USER := $(shell grep -E '^POSTGRES_USER=' .env 2>/dev/null | cut -d= -f2)
DB_PASSWORD := $(shell grep -E '^POSTGRES_PASSWORD=' .env 2>/dev/null | cut -d= -f2)
DB_NAME := $(shell grep -E '^POSTGRES_DB=' .env 2>/dev/null | cut -d= -f2)
DB_PORT := $(shell grep -E '^POSTGRES_PORT=' .env 2>/dev/null | cut -d= -f2)
DATABASE_URL_LOCAL := postgresql+psycopg://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)

help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  Local:"
	@echo "    make install        - instala dependências"
	@echo "    make test           - executa testes"
	@echo "    make lint           - verifica o código"
	@echo "    make format         - formata o código"
	@echo "    make run            - inicia o servidor"
	@echo "    make clean          - remove arquivos temporários"
	@echo ""
	@echo "  Docker:"
	@echo "    make env            - cria o .env a partir do .env.example"
	@echo "    make up             - sobe os containers em background"
	@echo "    make down           - para e remove os containers"
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
	@echo "    make db-migration msg=\"...\" - cria uma nova migration (autogenerate)"
	@echo "    make db-current             - mostra a revisão atual do banco"

install:
	$(POETRY) install

test:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(PYTEST)

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

run:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(UVICORN) app.main:app --reload --app-dir src

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +

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
	$(COMPOSE) exec db psql -U $$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2) -d $$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2)

# O cache do Pytest é gravado em /tmp para não criar arquivos de propriedade
# do root na árvore local, já que o código entra no container por bind mount.
docker-test:
	$(COMPOSE) exec -e PYTEST_ADDOPTS="-o cache_dir=/tmp/pytest_cache" backend pytest

docker-clean:
	$(COMPOSE) down -v --rmi local

db-upgrade:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) upgrade head

db-migration:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) revision --autogenerate -m "$(msg)"

db-current:
	export DATABASE_URL=$(DATABASE_URL_LOCAL); $(ALEMBIC) current
