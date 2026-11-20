import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { mockApi, renderApp } from "../helpers";

const ana = {
  id: 1,
  name: "Ana Souza",
  birth_date: "1990-05-01",
  nationality: "Brasileira",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

it("mostra carregando e depois a lista de atores", async () => {
  mockApi({ "GET /actors": [200, [ana]] });

  renderApp("/atores");

  expect(screen.getByText("Carregando atores...")).toBeInTheDocument();
  expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText("Brasileira · 01/05/1990")).toBeInTheDocument();
});

it("mostra a mensagem de lista vazia", async () => {
  mockApi({ "GET /actors": [200, []] });

  renderApp("/atores");

  expect(
    await screen.findByText("Nenhum ator cadastrado."),
  ).toBeInTheDocument();
});

it("mostra erro de conexão quando a API falha", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("x")));

  renderApp("/atores");

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
});

it("busca atores pelo nome", async () => {
  const calls = mockApi({
    "GET /actors": [200, [ana]],
    "GET /actors?name=ana": [200, [ana]],
  });
  renderApp("/atores");
  await screen.findByText("Ana Souza");

  await userEvent.type(screen.getByLabelText("Buscar ator por nome"), "ana");

  await waitFor(() =>
    expect(calls.some((c) => c.path === "/actors?name=ana")).toBe(true),
  );
});

it("não mostra erro antes do blur e mostra depois dele", async () => {
  mockApi({ "GET /actors": [200, []] });
  renderApp("/atores/novo");

  const name = screen.getByLabelText("Nome");
  expect(screen.queryByText("Informe o nome do ator.")).not.toBeInTheDocument();

  await userEvent.click(name);
  await userEvent.tab();

  expect(
    await screen.findByText("Informe o nome do ator."),
  ).toBeInTheDocument();
});

it("bloqueia o envio com erro de validação", async () => {
  const calls = mockApi({ "POST /actors": [201, ana] });
  renderApp("/atores/novo");

  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

  expect(
    await screen.findByText("Informe o nome do ator."),
  ).toBeInTheDocument();
  expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
});

it("cadastra um ator, volta para a lista e mostra o sucesso", async () => {
  const calls = mockApi({
    "POST /actors": [201, ana],
    "GET /actors": [200, [ana]],
  });
  renderApp("/atores/novo");

  await userEvent.type(screen.getByLabelText("Nome"), "  Ana Souza ");
  await userEvent.type(screen.getByLabelText("Nacionalidade"), "Brasileira");
  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

  expect(
    await screen.findByText("Ator cadastrado com sucesso."),
  ).toBeInTheDocument();
  expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
  const post = calls.find((c) => c.method === "POST");
  expect(post.body).toEqual({
    name: "Ana Souza",
    birth_date: null,
    nationality: "Brasileira",
  });
});

it("mostra o erro 409 da API e preserva o texto digitado", async () => {
  mockApi({
    "POST /actors": [409, { detail: "Já existe um ator com esse nome" }],
  });
  renderApp("/atores/novo");

  await userEvent.type(screen.getByLabelText("Nome"), "Ana Souza");
  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um ator com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue("Ana Souza");
});

it("edita um ator carregando os valores atuais", async () => {
  const calls = mockApi({
    "GET /actors/1": [200, ana],
    "PUT /actors/1": [200, { ...ana, name: "Ana Lima" }],
    "GET /actors": [200, []],
  });
  renderApp("/atores/1/editar");

  const name = await screen.findByLabelText("Nome");
  expect(name).toHaveValue("Ana Souza");
  await userEvent.clear(name);
  await userEvent.type(name, "Ana Lima");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(
    await screen.findByText("Ator atualizado com sucesso."),
  ).toBeInTheDocument();
  expect(calls.find((c) => c.method === "PUT").body.name).toBe("Ana Lima");
});

it("mostra o erro 404 ao editar um ator inexistente", async () => {
  mockApi({ "GET /actors/9": [404, { detail: "Ator não encontrado" }] });

  renderApp("/atores/9/editar");

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Ator não encontrado",
  );
});

it("cancelar o modal não exclui o ator", async () => {
  const calls = mockApi({ "GET /actors": [200, [ana]] });
  renderApp("/atores");
  await userEvent.click(await screen.findByLabelText("Excluir ator Ana Souza"));

  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("Excluir Ana Souza?");
  await userEvent.click(
    within(dialog).getByRole("button", { name: "Cancelar" }),
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(calls.filter((c) => c.method === "DELETE")).toHaveLength(0);
});

it("confirmar o modal exclui o ator e mostra o sucesso", async () => {
  let actors = [ana];
  const calls = mockApi({
    "GET /actors": () => [200, actors],
    "DELETE /actors/1": () => {
      actors = [];
      return [204, null];
    },
  });
  renderApp("/atores");
  await userEvent.click(await screen.findByLabelText("Excluir ator Ana Souza"));

  await userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir" }),
  );

  expect(
    await screen.findByText("Ator excluído com sucesso."),
  ).toBeInTheDocument();
  expect(
    calls.some((c) => c.method === "DELETE" && c.path === "/actors/1"),
  ).toBe(true);
  expect(
    await screen.findByText("Nenhum ator cadastrado."),
  ).toBeInTheDocument();
});

it("mostra a página 404 para rotas inexistentes", () => {
  renderApp("/nao-existe");

  expect(screen.getByText("Página não encontrada")).toBeInTheDocument();
});
