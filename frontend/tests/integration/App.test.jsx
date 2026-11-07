import { render, screen } from "@testing-library/react";
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
