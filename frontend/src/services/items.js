import { request } from "./api";

const JSON_HEADERS = { "Content-Type": "application/json" };

function withBody(method, body) {
  return { method, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

export function listItems(limit) {
  const query = limit === undefined ? "" : `?limit=${limit}`;
  return request(`/items${query}`);
}

export function getItem(id) {
  return request(`/items/${id}`);
}

export function createItem({ name, description }) {
  return request("/items", withBody("POST", { name, description }));
}

export function replaceItem(id, { name, description }) {
  return request(`/items/${id}`, withBody("PUT", { name, description }));
}

export function updateItem(id, partial) {
  return request(`/items/${id}`, withBody("PATCH", partial));
}

export function deleteItem(id) {
  return request(`/items/${id}`, { method: "DELETE" });
}
