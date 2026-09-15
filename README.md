# C216-L1-Francisco-270

Repositório da disciplina C216 (Sistemas Distribuídos) — entregas práticas.

## Testes

O backend usa [Pytest](https://docs.pytest.org/) para os testes automatizados. Para executá-los localmente:

```bash
make install   # instala as dependências via Poetry
make test      # executa a suíte de testes
```

Os testes também rodam automaticamente via GitHub Actions (`.github/workflows/ci.yml`) a cada `push` e `pull request`, com dois jobs em paralelo: `lint` (`ruff format --check` e `ruff check`) e `test` (`poetry run pytest`).
