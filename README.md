# C216-L1-Francisco-270

Repositório da disciplina C216 (Sistemas Distribuídos) — entregas práticas.

## Backend

A API é organizada em camadas:

```text
backend/src/app/
├── main.py               # inicialização da aplicação e registro dos routers
├── api/routes/            # endpoints HTTP (health, items)
├── schemas/                # modelos Pydantic
├── services/                # regras de negócio
└── repositories/            # acesso aos dados (em memória, por enquanto)
```

## Testes

O backend usa [Pytest](https://docs.pytest.org/) para os testes automatizados, separados em unitários e de integração:

```text
backend/tests/
├── unit/          # testam a camada de serviço diretamente, sem HTTP
└── integration/   # testam os endpoints via TestClient
```

Para executá-los localmente:

```bash
make install   # instala as dependências via Poetry
make test      # executa a suíte de testes
```

Os testes também rodam automaticamente via GitHub Actions (`.github/workflows/ci.yml`) a cada `push` e `pull request`, com dois jobs em paralelo: `lint` (`ruff format --check` e `ruff check`) e `test` (`poetry run pytest`).
