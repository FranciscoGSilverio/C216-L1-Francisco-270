export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(response) {
  const fallback = `Erro ${response.status} ao acessar a API.`;
  try {
    const body = await response.json();
    return typeof body?.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError("Não foi possível conectar à API.", null);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return null;

  return response.json();
}
