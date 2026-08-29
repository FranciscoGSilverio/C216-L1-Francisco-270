.PHONY: help install test lint format run clean \
        env up down build logs ps restart backend-shell db-shell docker-test docker-clean

BACKEND_DIR := backend
POETRY := cd $(BACKEND_DIR) && poetry
PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff
COMPOSE := docker compose

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

install:
	$(POETRY) install

test:
	$(PYTEST)

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

run:
	$(UVICORN) app.main:app --reload --app-dir src

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
