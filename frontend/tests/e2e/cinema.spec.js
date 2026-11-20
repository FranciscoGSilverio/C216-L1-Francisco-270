import { expect, test } from "@playwright/test";

// Os testes rodam contra a stack real (frontend, API e banco). Cada teste usa
// nomes únicos e não assume que as listas estejam vazias.
function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function createActor(page, name) {
  await page.goto("/atores/novo");
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Ator cadastrado com sucesso.")).toBeVisible();
}

async function createMovie(page, title, year = "2020") {
  await page.goto("/filmes/novo");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Ano").fill(year);
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Filme cadastrado com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

async function linkActor(page, actorName, character) {
  await page
    .getByLabel("Ator", { exact: true })
    .selectOption({ label: actorName });
  await page.getByLabel("Personagem", { exact: true }).fill(character);
  await page.getByRole("button", { name: "Adicionar" }).click();
}

async function confirmDelete(page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir" })
    .click();
}

test("carrega a interface com as abas Filmes e Atores", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(nav.getByRole("link", { name: "Filmes" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Atores" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Filmes" })).toBeVisible();
  await expect(page.getByText("Carregando filmes...")).toBeHidden();
});

test("cadastra atores e filme, vincula o elenco e ele persiste após reload", async ({
  page,
}) => {
  const ana = uniqueName("Ana");
  const bruno = uniqueName("Bruno");
  const title = uniqueName("Filme");

  await createActor(page, ana);
  await createActor(page, bruno);
  await createMovie(page, title);

  await linkActor(page, ana, "Heroína");
  await expect(page.getByText("Ator vinculado ao filme.")).toBeVisible();
  await linkActor(page, bruno, "Vilão");
  await expect(page.getByText(`${bruno} como Vilão`)).toBeVisible();
  await expect(page.getByText(`${ana} como Heroína`)).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(`${ana} como Heroína`)).toBeVisible();
  await expect(page.getByText(`${bruno} como Vilão`)).toBeVisible();
});

test("valida o campo obrigatório após o blur e bloqueia o envio", async ({
  page,
}) => {
  await page.goto("/atores/novo");

  await page.getByLabel("Nome", { exact: true }).focus();
  await page.getByLabel("Nacionalidade").focus();
  await expect(page.getByText("Informe o nome do ator.")).toBeVisible();

  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page).toHaveURL(/\/atores\/novo$/);
});

test("edita um ator e um filme e as alterações persistem após reload", async ({
  page,
}) => {
  const actor = uniqueName("Carla");
  const newActor = uniqueName("Carla-editada");
  const title = uniqueName("Filme");
  const newTitle = uniqueName("Filme-editado");

  await createActor(page, actor);
  await page.goto("/atores");
  await page.getByRole("link", { name: `Editar ator ${actor}` }).click();
  await page.getByLabel("Nome", { exact: true }).fill(newActor);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Ator atualizado com sucesso.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(newActor)).toBeVisible();

  await createMovie(page, title);
  await page.getByRole("link", { name: `Editar filme ${title}` }).click();
  await page.getByLabel("Título").fill(newTitle);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Filme atualizado com sucesso.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: newTitle })).toBeVisible();
});

test("vínculo repetido de outra aba mostra erro de elenco duplicado", async ({
  page,
  context,
}) => {
  const ana = uniqueName("Dora");
  const title = uniqueName("Filme");
  await createActor(page, ana);
  await createMovie(page, title);
  const movieUrl = page.url();

  // A segunda aba carrega o formulário antes do vínculo, com o ator ainda disponível.
  const other = await context.newPage();
  await other.goto(movieUrl);
  await expect(other.getByLabel("Ator", { exact: true })).toBeVisible();

  await linkActor(page, ana, "Primeira");
  await expect(page.getByText(`${ana} como Primeira`)).toBeVisible();

  await linkActor(other, ana, "Segunda");
  await expect(other.getByRole("alert")).toContainText(
    "Este ator já está no elenco deste filme",
  );
});

test("exclui vínculo, filme e ator pelo modal de confirmação", async ({
  page,
}) => {
  const ana = uniqueName("Eva");
  const title = uniqueName("Filme");
  await createActor(page, ana);
  await createMovie(page, title);
  await linkActor(page, ana, "Protagonista");
  await expect(page.getByText(`${ana} como Protagonista`)).toBeVisible();

  await page.getByRole("button", { name: `Remover ${ana} do elenco` }).click();
  await confirmDelete(page);
  await expect(page.getByText("Ator removido do elenco.")).toBeVisible();
  await expect(page.getByText(`${ana} como Protagonista`)).toBeHidden();

  await page.getByRole("button", { name: `Excluir filme ${title}` }).click();
  await confirmDelete(page);
  await expect(page.getByText("Filme excluído com sucesso.")).toBeVisible();
  await expect(page.getByText(title)).toBeHidden();

  // O ator continua existindo depois que o filme foi excluído.
  await page.goto("/atores");
  await expect(page.getByText(ana)).toBeVisible();
  await page.getByRole("button", { name: `Excluir ator ${ana}` }).click();
  await confirmDelete(page);
  await expect(page.getByText("Ator excluído com sucesso.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(ana)).toBeHidden();
});
