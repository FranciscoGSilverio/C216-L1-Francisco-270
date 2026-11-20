import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { mockApi, renderApp } from "../helpers";

const movie = {
  id: 1,
  title: "Cidade de Deus",
  year: 2002,
  genre: "Drama",
  synopsis: "Rio de Janeiro",
  cast: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

it("redireciona a raiz para a lista de filmes", async () => {
  mockApi({ "GET /movies": [200, [movie]] });

  renderApp("/");

  expect(await screen.findByText("Cidade de Deus")).toBeInTheDocument();
  expect(screen.getByText("2002 · Drama")).toBeInTheDocument();
});

it("mostra carregando e a lista vazia de filmes", async () => {
  mockApi({ "GET /movies": [200, []] });

  renderApp("/filmes");

  expect(screen.getByText("Carregando filmes...")).toBeInTheDocument();
  expect(
    await screen.findByText("Nenhum filme cadastrado."),
  ).toBeInTheDocument();
});

it("busca filmes pelo título", async () => {
  const calls = mockApi({
    "GET /movies": [200, [movie]],
    "GET /movies?title=cidade": [200, [movie]],
  });
  renderApp("/filmes");
  await screen.findByText("Cidade de Deus");

  await userEvent.type(
    screen.getByLabelText("Buscar filme por título"),
    "cidade",
  );

  await waitFor(() =>
    expect(calls.some((c) => c.path === "/movies?title=cidade")).toBe(true),
  );
});

it("valida o ano depois do blur", async () => {
  mockApi({});
  renderApp("/filmes/novo");

  await userEvent.type(screen.getByLabelText("Ano"), "1887");
  await userEvent.tab();

  expect(
    await screen.findByText("O ano deve ser no mínimo 1888."),
  ).toBeInTheDocument();
});

it("cadastra um filme e abre o detalhe com a mensagem de sucesso", async () => {
  const calls = mockApi({
    "POST /movies": [201, movie],
    "GET /movies/1": [200, movie],
    "GET /actors": [200, []],
  });
  renderApp("/filmes/novo");

  await userEvent.type(screen.getByLabelText("Título"), "Cidade de Deus");
  await userEvent.type(screen.getByLabelText("Ano"), "2002");
  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

  expect(
    await screen.findByText("Filme cadastrado com sucesso."),
  ).toBeInTheDocument();
  expect(calls.find((c) => c.method === "POST").body).toEqual({
    title: "Cidade de Deus",
    year: 2002,
    genre: null,
    synopsis: null,
  });
});

it("mostra o erro 409 de filme duplicado preservando o formulário", async () => {
  mockApi({
    "POST /movies": [
      409,
      { detail: "Já existe um filme com esse título e ano" },
    ],
  });
  renderApp("/filmes/novo");

  await userEvent.type(screen.getByLabelText("Título"), "Cidade de Deus");
  await userEvent.type(screen.getByLabelText("Ano"), "2002");
  await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um filme com esse título e ano",
  );
  expect(screen.getByLabelText("Título")).toHaveValue("Cidade de Deus");
});

it("edita um filme", async () => {
  const calls = mockApi({
    "GET /movies/1": [200, movie],
    "PUT /movies/1": [200, { ...movie, year: 2003 }],
    "GET /actors": [200, []],
  });
  renderApp("/filmes/1/editar");

  const year = await screen.findByLabelText("Ano");
  expect(year).toHaveValue("2002");
  await userEvent.clear(year);
  await userEvent.type(year, "2003");
  await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(
    await screen.findByText("Filme atualizado com sucesso."),
  ).toBeInTheDocument();
  expect(calls.find((c) => c.method === "PUT").body.year).toBe(2003);
});

it("exclui um filme da lista somente após confirmar no modal", async () => {
  let movies = [movie];
  const calls = mockApi({
    "GET /movies": () => [200, movies],
    "DELETE /movies/1": () => {
      movies = [];
      return [204, null];
    },
  });
  renderApp("/filmes");
  await userEvent.click(
    await screen.findByLabelText("Excluir filme Cidade de Deus"),
  );
  expect(calls.filter((c) => c.method === "DELETE")).toHaveLength(0);

  await userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir" }),
  );

  expect(
    await screen.findByText("Filme excluído com sucesso."),
  ).toBeInTheDocument();
});
