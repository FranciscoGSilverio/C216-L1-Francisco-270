import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { mockApi, renderApp } from "../helpers";

const ana = { id: 1, name: "Ana Souza" };
const bia = { id: 2, name: "Bia Lima" };

function movie(cast = []) {
  return {
    id: 1,
    title: "Cidade de Deus",
    year: 2002,
    genre: null,
    synopsis: null,
    cast,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

it("mostra o elenco do filme com ator e personagem", async () => {
  mockApi({
    "GET /movies/1": [
      200,
      movie([{ actor_id: 1, actor_name: "Ana Souza", character: "Buscapé" }]),
    ],
    "GET /actors": [200, [ana, bia]],
  });

  renderApp("/filmes/1");

  expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText(/como Buscapé/)).toBeInTheDocument();
});

it("o seletor não lista atores que já estão no elenco", async () => {
  mockApi({
    "GET /movies/1": [
      200,
      movie([{ actor_id: 1, actor_name: "Ana Souza", character: "Buscapé" }]),
    ],
    "GET /actors": [200, [ana, bia]],
  });

  renderApp("/filmes/1");

  const select = await screen.findByLabelText("Ator");
  const options = within(select)
    .getAllByRole("option")
    .map((o) => o.textContent);
  expect(options).toEqual(["Selecione um ator", "Bia Lima"]);
});

it("avisa para cadastrar atores quando não existe nenhum", async () => {
  mockApi({ "GET /movies/1": [200, movie()], "GET /actors": [200, []] });

  renderApp("/filmes/1");

  expect(
    await screen.findByText(/Cadastre atores para montar o elenco/),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Novo ator" })).toHaveAttribute(
    "href",
    "/atores/novo",
  );
});

it("vincula um ator com o personagem e recarrega o elenco", async () => {
  let cast = [];
  const calls = mockApi({
    "GET /movies/1": () => [200, movie(cast)],
    "GET /actors": [200, [ana, bia]],
    "POST /movies/1/cast": (body) => {
      cast = [
        {
          actor_id: body.actor_id,
          actor_name: "Ana Souza",
          character: body.character,
        },
      ];
      return [201, cast[0]];
    },
  });
  renderApp("/filmes/1");

  await userEvent.selectOptions(await screen.findByLabelText("Ator"), "1");
  await userEvent.type(screen.getByLabelText("Personagem"), "Buscapé");
  await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(
    await screen.findByText("Ator vinculado ao filme."),
  ).toBeInTheDocument();
  expect(await screen.findByText(/como Buscapé/)).toBeInTheDocument();
  expect(calls.find((c) => c.method === "POST").body).toEqual({
    actor_id: 1,
    character: "Buscapé",
  });
});

it("exige ator e personagem, mostrando os erros", async () => {
  const calls = mockApi({
    "GET /movies/1": [200, movie()],
    "GET /actors": [200, [ana]],
  });
  renderApp("/filmes/1");

  await userEvent.click(
    await screen.findByRole("button", { name: "Adicionar" }),
  );

  expect(await screen.findByText("Selecione um ator.")).toBeInTheDocument();
  expect(screen.getByText("Informe o personagem.")).toBeInTheDocument();
  expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
});

it("mostra o erro 409 de vínculo duplicado e mantém o formulário", async () => {
  mockApi({
    "GET /movies/1": [200, movie()],
    "GET /actors": [200, [ana]],
    "POST /movies/1/cast": [
      409,
      { detail: "Este ator já está no elenco deste filme" },
    ],
  });
  renderApp("/filmes/1");

  await userEvent.selectOptions(await screen.findByLabelText("Ator"), "1");
  await userEvent.type(screen.getByLabelText("Personagem"), "Buscapé");
  await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Este ator já está no elenco deste filme",
  );
  expect(screen.getByLabelText("Personagem")).toHaveValue("Buscapé");
});

it("edita o personagem de um ator do elenco", async () => {
  const calls = mockApi({
    "GET /movies/1": [
      200,
      movie([{ actor_id: 1, actor_name: "Ana Souza", character: "Buscapé" }]),
    ],
    "GET /actors": [200, [ana]],
    "PUT /movies/1/cast/1": [
      200,
      { actor_id: 1, actor_name: "Ana Souza", character: "Zé" },
    ],
  });
  renderApp("/filmes/1");

  await userEvent.click(
    await screen.findByLabelText("Editar personagem de Ana Souza"),
  );
  const field = screen.getByLabelText("Personagem de Ana Souza");
  await userEvent.clear(field);
  await userEvent.type(field, "Zé");
  await userEvent.click(
    screen.getByLabelText("Salvar personagem de Ana Souza"),
  );

  expect(await screen.findByText("Personagem atualizado.")).toBeInTheDocument();
  expect(calls.find((c) => c.method === "PUT").body).toEqual({
    character: "Zé",
  });
});

it("remove do elenco só depois de confirmar no modal", async () => {
  const calls = mockApi({
    "GET /movies/1": [
      200,
      movie([{ actor_id: 1, actor_name: "Ana Souza", character: "Buscapé" }]),
    ],
    "GET /actors": [200, [ana]],
    "DELETE /movies/1/cast/1": [204, null],
  });
  renderApp("/filmes/1");
  await userEvent.click(
    await screen.findByLabelText("Remover Ana Souza do elenco"),
  );
  expect(calls.filter((c) => c.method === "DELETE")).toHaveLength(0);

  await userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir" }),
  );

  expect(
    await screen.findByText("Ator removido do elenco."),
  ).toBeInTheDocument();
  expect(
    calls.some((c) => c.method === "DELETE" && c.path === "/movies/1/cast/1"),
  ).toBe(true);
});

it("exclui o filme pelo detalhe com confirmação e volta para a lista", async () => {
  const calls = mockApi({
    "GET /movies/1": [200, movie()],
    "GET /actors": [200, []],
    "DELETE /movies/1": [204, null],
    "GET /movies": [200, []],
  });
  renderApp("/filmes/1");

  await userEvent.click(
    await screen.findByLabelText("Excluir filme Cidade de Deus"),
  );
  await userEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir" }),
  );

  expect(
    await screen.findByText("Filme excluído com sucesso."),
  ).toBeInTheDocument();
  expect(
    calls.some((c) => c.method === "DELETE" && c.path === "/movies/1"),
  ).toBe(true);
});

it("mostra o erro 404 de filme inexistente no detalhe", async () => {
  mockApi({
    "GET /movies/9": [404, { detail: "Filme não encontrado" }],
    "GET /actors": [200, []],
  });

  renderApp("/filmes/9");

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Filme não encontrado",
  );
});

it("marca ator e personagem como obrigatórios ao adicionar ao elenco", async () => {
  mockApi({ "GET /movies/1": [200, movie()], "GET /actors": [200, [ana]] });
  renderApp("/filmes/1");

  expect(await screen.findByLabelText("Ator")).toHaveAttribute(
    "aria-required",
    "true",
  );
  expect(screen.getByLabelText("Personagem")).toHaveAttribute(
    "aria-required",
    "true",
  );
});
