import { request } from "./api";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function listActors(name) {
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  return request(`/actors${query}`);
}

export function getActor(id) {
  return request(`/actors/${id}`);
}

export function createActor(values) {
  return request("/actors", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  });
}

export function replaceActor(id, values) {
  return request(`/actors/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  });
}

export function deleteActor(id) {
  return request(`/actors/${id}`, { method: "DELETE" });
}
