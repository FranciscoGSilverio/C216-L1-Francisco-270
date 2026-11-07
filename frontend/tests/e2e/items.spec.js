import { expect, test } from "@playwright/test";

// Os testes rodam contra a stack real (frontend + API + banco). Cada teste usa
// nomes únicos e não assume que a lista esteja vazia.
function uniqueName(prefix = "Notebook") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function addItem(page, name, description = "14 polegadas") {
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Descrição").fill(description);
  await page.getByRole("button", { name: "Adicionar" }).click();
}

test("carrega a interface com formulário e lista", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Itens cadastrados" }),
  ).toBeVisible();
  await expect(page.getByText("Carregando itens...")).toBeHidden();
});

test("mostra erro de validação ao tentar cadastrar sem nome", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toContainText("O nome é obrigatório.");
});

test("cadastra um item e ele persiste após page.reload()", async ({ page }) => {
  const name = uniqueName();
  await page.goto("/");

  await addItem(page, name);
  await expect(page.getByText(name)).toBeVisible();

  await page.reload();

  await expect(page.getByText(name)).toBeVisible();
});

test('cadastrar o mesmo nome de novo mostra "Já existe um item com esse nome"', async ({
  page,
}) => {
  const name = uniqueName();
  await page.goto("/");
  await addItem(page, name);
  await expect(page.getByText(name)).toBeVisible();

  await addItem(page, name);

  await expect(page.getByRole("alert")).toContainText(
    "Já existe um item com esse nome",
  );
});

test("edita um item e a alteração persiste após page.reload()", async ({
  page,
}) => {
  const name = uniqueName();
  const newName = uniqueName("Editado");
  await page.goto("/");
  await addItem(page, name);
  await expect(page.getByText(name)).toBeVisible();

  await page.getByRole("button", { name: `Editar ${name}` }).click();
  const row = page
    .getByRole("listitem")
    .filter({ has: page.getByLabel("Nome") });
  await row.getByLabel("Nome").fill(newName);
  await row.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText(newName)).toBeVisible();

  await page.reload();

  await expect(page.getByText(newName)).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeHidden();
});

test("exclui um item e ele não volta após page.reload()", async ({ page }) => {
  const name = uniqueName();
  await page.goto("/");
  await addItem(page, name);
  await expect(page.getByText(name)).toBeVisible();

  await page.getByRole("button", { name: `Excluir ${name}` }).click();
  await expect(page.getByText(name)).toBeHidden();

  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Itens cadastrados" }),
  ).toBeVisible();
  await expect(page.getByText(name)).toBeHidden();
});
