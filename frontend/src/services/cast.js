import { request } from "./api";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function addCastMember(movieId, { actor_id, character }) {
  return request(`/movies/${movieId}/cast`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ actor_id, character }),
  });
}

export function updateCastMember(movieId, actorId, { character }) {
  return request(`/movies/${movieId}/cast/${actorId}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ character }),
  });
}

export function removeCastMember(movieId, actorId) {
  return request(`/movies/${movieId}/cast/${actorId}`, { method: "DELETE" });
}
