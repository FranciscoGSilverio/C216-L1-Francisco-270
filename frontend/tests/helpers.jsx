import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../src/App";

// Instala um fetch falso. `routes` mapeia "MÉTODO /caminho" para uma função
// (ou valor) que devolve [status, corpo]. Chamadas sem rota viram erro 500.
export function mockApi(routes) {
  const calls = [];
  const fakeFetch = vi.fn(async (url, options = {}) => {
    const method = options.method ?? "GET";
    const path = String(url).replace("http://localhost:8000", "");
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ method, path, body });

    const handler = routes[`${method} ${path}`];
    if (handler === undefined) {
      return {
        ok: false,
        status: 500,
        json: async () => ({ detail: "sem rota" }),
      };
    }
    const [status, payload] =
      typeof handler === "function" ? handler(body) : handler;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => payload,
    };
  });
  vi.stubGlobal("fetch", fakeFetch);
  return calls;
}

export function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
