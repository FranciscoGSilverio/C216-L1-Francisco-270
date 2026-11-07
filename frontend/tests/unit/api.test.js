import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ApiError, request } from "../../src/services/api";

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("converte falha de rede em ApiError de conexão", async () => {
  fetch.mockRejectedValue(new TypeError("Failed to fetch"));

  const error = await request("/items").catch((e) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error.message).toBe("Não foi possível conectar à API.");
  expect(error.status).toBeNull();
});

it("usa o detail string do corpo de erro e guarda o status", async () => {
  fetch.mockResolvedValue(
    jsonResponse(409, { detail: "Já existe um item com esse nome" }),
  );

  const error = await request("/items").catch((e) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error.message).toBe("Já existe um item com esse nome");
  expect(error.status).toBe(409);
});

it("usa mensagem genérica quando detail é uma lista (422)", async () => {
  fetch.mockResolvedValue(
    jsonResponse(422, { detail: [{ loc: ["body", "name"], msg: "x" }] }),
  );

  const error = await request("/items").catch((e) => e);

  expect(error.message).toBe("Erro 422 ao acessar a API.");
  expect(error.status).toBe(422);
});

it("retorna null quando a resposta é 204", async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 204,
    json: () => Promise.reject(new Error("sem corpo")),
  });

  await expect(request("/items/1", { method: "DELETE" })).resolves.toBeNull();
});

it("retorna o JSON em caso de sucesso", async () => {
  fetch.mockResolvedValue(jsonResponse(200, [{ id: 1, name: "Caneta" }]));

  await expect(request("/items")).resolves.toEqual([{ id: 1, name: "Caneta" }]);
});
