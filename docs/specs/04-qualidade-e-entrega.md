# Spec 04 — Qualidade e entrega (E2E, CI, README, divulgação de IA e PR)

Status: **aprovada**

## Problema

Falta provar o fluxo completo em navegador real, automatizar as verificações no GitHub,
documentar o projeto de forma fiel ao que existe e entregar a branch `projeto-final` com o
PR aberto contra `main`, como exige o PDF.

## Escopo

1. Teste E2E com Playwright e o alvo `make e2e` (stack isolada).
2. Workflows de CI do backend e do frontend.
3. README e documentação do uso de agentes de programação.
4. Validação final e abertura do PR (sem merge).

Fora do escopo: deploy, autenticação, o vídeo em si (gravado pelo desenvolvedor).

## 1. E2E (Playwright)

**Stack isolada:** `docker-compose.e2e.yml` sobrepõe o Compose normal com nomes `cinema-e2e-*`
e `CORS_ORIGINS` da porta de teste. `make e2e` usa o projeto Compose `cinema-e2e`, portas
15432/18000/15173 e uma **senha de banco aleatória gerada a cada execução** (`openssl rand`),
sem depender do `.env`. Sequência: `up -d --build --wait`, Playwright, e **sempre**
`down -v --remove-orphans`, saindo com o status do Playwright. Não toca a stack normal.

**Configuração:** `playwright.config.js` com `baseURL = E2E_BASE_URL ?? http://localhost:5173`,
sem `webServer`, Chromium, relatório HTML no CI.

**Cenários** (nomes únicos por execução com `Date.now()`):

| # | Cenário |
|---|---|
| a | Interface carrega com as abas Filmes e Atores |
| b | **Fluxo da apresentação:** cadastra 2 atores, cadastra um filme, vincula os dois com personagens, consulta o filme com o elenco, recarrega a página (`reload`) e o elenco continua |
| c | Edita um ator e um filme; a alteração persiste após `reload` |
| d | Vincular o mesmo ator de novo mostra "Este ator já está no elenco deste filme" |
| e | Exclui um vínculo, o filme e um ator pelo modal de confirmação; o ator continua existindo após excluir o filme |

`make check-all` = `lint test frontend-check frontend-test frontend-build e2e`.

## 2. CI (GitHub Actions)

Dois workflows, ambos em `pull_request` e `push`, **sem filtros de caminho** (o PDF manda
conferir que os de frontend e backend realmente rodam no PR).

| Workflow | Jobs |
|---|---|
| `ci.yml` | **Ruff** (`ruff check` e `ruff format --check`); **Pytest** com serviço PostgreSQL, `alembic upgrade head`, `alembic check` e `pytest` |
| `ci-frontend.yml` | **Biome, Vitest, Build e Playwright**: `npm ci`, `npm run check`, `npm run test`, `npm run build`, Chromium, `make e2e`; relatório do Playwright como artefato em caso de falha |

Sem senha literal nos workflows: a senha do Postgres do job é montada a partir do id da
execução (`${{ github.run_id }}`), valor descartável.

## 3. Documentação

**README.md** (português, específico do projeto), com as seções exigidas pelo PDF: objetivo e
tema; funcionalidades (com regras de negócio e códigos HTTP); tecnologias; estrutura
resumida; pré-requisitos; variáveis de ambiente (tabela de todas as do `.env.example`);
comandos de execução; migrações; testes; como acessar (`http://localhost:5173`, `/docs` da API);
modelo de dados; seção "Vídeo demonstrativo" com o marcador `LINK_DO_VIDEO` (o desenvolvedor troca
pelo link real). Inclui as advertências descobertas na validação: ordem `make frontend-install`
antes de `make up`; Chromium do Playwright para rodar `make e2e` localmente.

**Divulgação de IA** (decisão do desenvolvedor, sujeita à resposta do monitor): seção curta no README
e `docs/uso-de-ia.md` descrevendo, sem exagero, o processo: specs em `docs/specs/` aprovadas
pelo desenvolvedor com data antes de cada bloco; o que o agente fez (escrita mecânica de código
e testes) e o que o desenvolvedor fez (decisões de domínio, revisão de cada bloco, aprovações,
correções, verificação, vídeo); como conferir (histórico do Git e specs). Os commits seguem sem
trailer de IA (ver `CLAUDE.md`).

**Roteiro do vídeo** (5 a 10 min, 6 partes do PDF) fica fora do Git, como apoio à narração do desenvolvedor.

## 4. Validação final e PR

- README seguido **literalmente** em um clone limpo: da instalação até a aplicação funcionando e `make check-all` verde.
- Sem segredos e sem restos do laboratório; histórico progressivo conferido.
- Push de `projeto-final` e PR `projeto-final` → `main` (sem merge, sem revisores), com descrição e checklist; aba Checks conferida (os dois workflows acionados e verdes); falhas corrigidas na própria branch.
- O link do PR e o do repositório vão para o Teams pelo desenvolvedor, junto com o link do vídeo.

## Critérios de aceite

- `make e2e` passa e `docker ps --filter name=cinema-e2e -q` fica vazio depois; uma falha proposital também derruba a stack.
- `make check-all` passa de ponta a ponta.
- **Pipeline do GitHub Actions aprovada após o push e a abertura do PR:** os dois workflows
  (`CI` e `CI - Frontend`) são acionados pelo PR `projeto-final` → `main` e concluem com
  sucesso na aba Checks. Qualquer falha é corrigida com novos commits na própria
  `projeto-final` até a execução ficar verde; o bloco só é dado como concluído depois disso.
- README segue a tabela acima e todos os comandos citados foram executados.
- Nenhuma senha literal em Makefile, Compose, workflows ou `.env.example` além do valor de exemplo.

## Riscos

- Playwright local precisa do Chromium (`npx playwright install chromium`); no WSL podem faltar bibliotecas do sistema.
- GitGuardian pode alertar sobre valores de exemplo; a senha do E2E é gerada em execução para evitar.
- A resposta do monitor sobre a divulgação de IA pode exigir ajuste da seção do README.

## Aprovação

Aprovado por: Francisco  Data: 19/11/2026

Observações do revisor:
- 19/11/2026 — revisão do bloco (E2E, CI, README e divulgação de IA) concluída e aprovada; autorizado o push e a abertura do PR.
