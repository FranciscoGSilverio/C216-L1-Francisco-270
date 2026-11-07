import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { API_URL } from "../../src/services/api";
import {
  createItem,
  deleteItem,
  getItem,
  listItems,
  replaceItem,
  updateItem,
} from "../../src/services/items";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function lastCall() {
  const [url, options = {}] = fetch.mock.calls.at(-1);
  return { url, options };
}

it("listItems chama GET /items", async () => {
  await listItems();

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items`);
  expect(options.method ?? "GET").toBe("GET");
});

it("listItems(5) chama GET /items?limit=5", async () => {
  await listItems(5);

  expect(lastCall().url).toBe(`${API_URL}/items?limit=5`);
});

it("getItem chama GET /items/{id}", async () => {
  await getItem(3);

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items/3`);
  expect(options.method ?? "GET").toBe("GET");
});

it("createItem chama POST /items com o corpo em JSON", async () => {
  await createItem({ name: "Caneta", description: "Azul" });

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items`);
  expect(options.method).toBe("POST");
  expect(options.headers["Content-Type"]).toBe("application/json");
  expect(JSON.parse(options.body)).toEqual({
    name: "Caneta",
    description: "Azul",
  });
});

it("replaceItem chama PUT /items/{id}", async () => {
  await replaceItem(2, { name: "Lápis", description: "" });

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items/2`);
  expect(options.method).toBe("PUT");
  expect(JSON.parse(options.body)).toEqual({ name: "Lápis", description: "" });
});

it("updateItem chama PATCH /items/{id}", async () => {
  await updateItem(2, { description: "Nova" });

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items/2`);
  expect(options.method).toBe("PATCH");
  expect(JSON.parse(options.body)).toEqual({ description: "Nova" });
});

it("deleteItem chama DELETE /items/{id}", async () => {
  await deleteItem(2);

  const { url, options } = lastCall();
  expect(url).toBe(`${API_URL}/items/2`);
  expect(options.method).toBe("DELETE");
});
