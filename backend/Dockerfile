# Imagem base enxuta com o Python usado no desenvolvimento do projeto.
FROM python:3.13-slim

# PYTHONDONTWRITEBYTECODE: evita gerar .pyc dentro do container.
# PYTHONUNBUFFERED: envia os logs direto para o stdout, sem buffer.
# POETRY_VIRTUALENVS_CREATE: instala as dependências no Python do container,
# já que o próprio container é o ambiente isolado.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.4.1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PYTHONPATH=/app/src

WORKDIR /app

RUN pip install --no-cache-dir "poetry==${POETRY_VERSION}"

# Copia apenas os manifestos primeiro: a camada de dependências só é
# reconstruída quando pyproject.toml ou poetry.lock mudam.
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

COPY . .

# O pacote da aplicação vive em src/ e não é instalado (--no-root), então o
# PYTHONPATH definido acima é o que permite importar `app` tanto pelo Uvicorn
# quanto pelo Pytest dentro do container.

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
