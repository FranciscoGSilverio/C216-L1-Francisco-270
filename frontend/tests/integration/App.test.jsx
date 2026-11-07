import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "../../src/App";

function reply(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject() : Promise.resolve(body)),
  });
}

function mockApi(handler) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url, options = {}) =>
      handler(url, options.method ?? "GET", options),
    ),
  );
}

function postCalls() {
  return fetch.mock.calls.filter(([, options]) => options?.method === "POST");
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("mostra o carregamento e depois os itens da API", async () => {
  mockApi(() => reply(200, [{ id: 1, name: "Notebook", description: "14" }]));
  render(<App />);

  expect(screen.getByRole("status")).toHaveTextContent("Carregando itens...");
  expect(await screen.findByText("Notebook")).toBeInTheDocument();
  expect(screen.queryByText("Carregando itens...")).not.toBeInTheDocument();
});

it("mostra a mensagem de lista vazia quando a API não tem itens", async () => {
  mockApi(() => reply(200, []));
  render(<App />);

  expect(
    await screen.findByText("Nenhum item cadastrado."),
  ).toBeInTheDocument();
});

it("mostra um alerta quando a listagem falha", async () => {
  mockApi(() => Promise.reject(new TypeError("Failed to fetch")));
  render(<App />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
});

it("cadastra um item e o exibe na lista", async () => {
  const user = userEvent.setup();
  mockApi((_url, method) =>
    method === "POST"
      ? reply(201, { id: 7, name: "Notebook", description: "14 polegadas" })
      : reply(200, []),
  );
  render(<App />);
  await screen.findByText("Nenhum item cadastrado.");

  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.type(screen.getByLabelText("Descrição"), "14 polegadas");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByText("Notebook")).toBeInTheDocument();
  expect(screen.getByText("14 polegadas")).toBeInTheDocument();
  expect(screen.queryByText("Nenhum item cadastrado.")).not.toBeInTheDocument();
  expect(JSON.parse(postCalls()[0][1].body)).toEqual({
    name: "Notebook",
    description: "14 polegadas",
  });
});

it("mostra o erro 409 e preserva o texto digitado", async () => {
  const user = userEvent.setup();
  mockApi((_url, method) =>
    method === "POST"
      ? reply(409, { detail: "Já existe um item com esse nome" })
      : reply(200, []),
  );
  render(<App />);
  await screen.findByText("Nenhum item cadastrado.");

  await user.type(screen.getByLabelText("Nome"), "Notebook");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um item com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue("Notebook");
});

it("não chama a API quando o nome está vazio", async () => {
  const user = userEvent.setup();
  mockApi(() => reply(200, []));
  render(<App />);
  await screen.findByText("Nenhum item cadastrado.");

  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(postCalls()).toHaveLength(0);
});

const notebook = { id: 1, name: "Notebook", description: "14" };

it("edita o nome de um item e atualiza a linha", async () => {
  const user = userEvent.setup();
  mockApi((_url, method, options) =>
    method === "PUT"
      ? reply(200, { id: 1, ...JSON.parse(options.body) })
      : reply(200, [notebook]),
  );
  render(<App />);

  await user.click(
    await screen.findByRole("button", { name: "Editar Notebook" }),
  );
  const row = screen.getByRole("listitem");
  await user.clear(within(row).getByLabelText("Nome"));
  await user.type(within(row).getByLabelText("Nome"), "Tablet");
  await user.click(within(row).getByRole("button", { name: "Salvar" }));

  expect(await screen.findByText("Tablet")).toBeInTheDocument();
  expect(screen.queryByText("Notebook")).not.toBeInTheDocument();
  const put = fetch.mock.calls.find(([, o]) => o?.method === "PUT");
  expect(put[0]).toMatch(/\/items\/1$/);
  expect(JSON.parse(put[1].body)).toEqual({
    name: "Tablet",
    description: "14",
  });
});

it("editar para nome duplicado mostra o erro e mantém a edição aberta", async () => {
  const user = userEvent.setup();
  mockApi((_url, method) =>
    method === "PUT"
      ? reply(409, { detail: "Já existe um item com esse nome" })
      : reply(200, [notebook]),
  );
  render(<App />);

  await user.click(
    await screen.findByRole("button", { name: "Editar Notebook" }),
  );
  const row = screen.getByRole("listitem");
  await user.click(within(row).getByRole("button", { name: "Salvar" }));

  expect(await within(row).findByRole("alert")).toHaveTextContent(
    "Já existe um item com esse nome",
  );
  expect(within(row).getByLabelText("Nome")).toBeInTheDocument();
});

it("exclui um item e remove a linha", async () => {
  const user = userEvent.setup();
  mockApi((_url, method) =>
    method === "DELETE" ? reply(204) : reply(200, [notebook]),
  );
  render(<App />);

  await user.click(
    await screen.findByRole("button", { name: "Excluir Notebook" }),
  );

  expect(
    await screen.findByText("Nenhum item cadastrado."),
  ).toBeInTheDocument();
  expect(fetch.mock.calls.some(([, o]) => o?.method === "DELETE")).toBe(true);
});

it("falha ao excluir mostra o alerta e mantém o item", async () => {
  const user = userEvent.setup();
  mockApi((_url, method) =>
    method === "DELETE"
      ? reply(500, { detail: "Erro interno" })
      : reply(200, [notebook]),
  );
  render(<App />);

  await user.click(
    await screen.findByRole("button", { name: "Excluir Notebook" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent("Erro interno");
  expect(screen.getByText("Notebook")).toBeInTheDocument();
});
