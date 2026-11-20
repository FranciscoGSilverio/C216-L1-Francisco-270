import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  createActor,
  deleteActor,
  getActor,
  listActors,
  replaceActor,
} from "../../src/services/actors";
import {
  addCastMember,
  removeCastMember,
  updateCastMember,
} from "../../src/services/cast";
import {
  createMovie,
  deleteMovie,
  getMovie,
  listMovies,
  replaceMovie,
} from "../../src/services/movies";

const API = "http://localhost:8000";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastCall() {
  const [url, options] = fetch.mock.calls.at(-1);
  return { url, options };
}

function jsonBody(options) {
  return JSON.parse(options.body);
}

it("listActors chama GET /actors sem barra final", async () => {
  await listActors();
  expect(lastCall().url).toBe(`${API}/actors`);
});

it("listActors codifica o nome da busca", async () => {
  await listActors("ana & bia");
  expect(lastCall().url).toBe(`${API}/actors?name=ana%20%26%20bia`);
});

it("getActor chama GET /actors/:id", async () => {
  await getActor(3);
  expect(lastCall().url).toBe(`${API}/actors/3`);
});

it("createActor envia POST com JSON", async () => {
  await createActor({ name: "Ana" });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/actors`);
  expect(options.method).toBe("POST");
  expect(options.headers["Content-Type"]).toBe("application/json");
  expect(jsonBody(options)).toEqual({ name: "Ana" });
});

it("replaceActor envia PUT com JSON", async () => {
  await replaceActor(3, { name: "Ana" });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/actors/3`);
  expect(options.method).toBe("PUT");
  expect(jsonBody(options)).toEqual({ name: "Ana" });
});

it("deleteActor envia DELETE", async () => {
  await deleteActor(3);
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/actors/3`);
  expect(options.method).toBe("DELETE");
});

it("listMovies sem filtros chama GET /movies", async () => {
  await listMovies();
  expect(lastCall().url).toBe(`${API}/movies`);
});

it("listMovies combina título e ator codificados", async () => {
  await listMovies({ title: "rei leão", actorId: 2 });
  expect(lastCall().url).toBe(`${API}/movies?title=rei+le%C3%A3o&actor_id=2`);
});

it("getMovie chama GET /movies/:id", async () => {
  await getMovie(5);
  expect(lastCall().url).toBe(`${API}/movies/5`);
});

it("createMovie envia POST com JSON", async () => {
  await createMovie({ title: "A", year: 2000 });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/movies`);
  expect(options.method).toBe("POST");
  expect(jsonBody(options)).toEqual({ title: "A", year: 2000 });
});

it("replaceMovie envia PUT com JSON", async () => {
  await replaceMovie(5, { title: "A", year: 2000 });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/movies/5`);
  expect(options.method).toBe("PUT");
});

it("deleteMovie envia DELETE", async () => {
  await deleteMovie(5);
  expect(lastCall().options.method).toBe("DELETE");
});

it("addCastMember envia POST com ator e personagem", async () => {
  await addCastMember(5, { actor_id: 2, character: "Buscapé" });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/movies/5/cast`);
  expect(options.method).toBe("POST");
  expect(jsonBody(options)).toEqual({ actor_id: 2, character: "Buscapé" });
});

it("updateCastMember envia PUT só com o personagem", async () => {
  await updateCastMember(5, 2, { character: "Zé" });
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/movies/5/cast/2`);
  expect(options.method).toBe("PUT");
  expect(jsonBody(options)).toEqual({ character: "Zé" });
});

it("removeCastMember envia DELETE", async () => {
  await removeCastMember(5, 2);
  const { url, options } = lastCall();
  expect(url).toBe(`${API}/movies/5/cast/2`);
  expect(options.method).toBe("DELETE");
});
