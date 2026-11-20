import { request } from "./api";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function listMovies({ title, actorId } = {}) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (actorId) params.set("actor_id", actorId);
  const query = params.toString() ? `?${params}` : "";
  return request(`/movies${query}`);
}

export function getMovie(id) {
  return request(`/movies/${id}`);
}

export function createMovie(values) {
  return request("/movies", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  });
}

export function replaceMovie(id, values) {
  return request(`/movies/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  });
}

export function deleteMovie(id) {
  return request(`/movies/${id}`, { method: "DELETE" });
}
