import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ItemForm } from "../../src/components/ItemForm";

it("mostra erro e não chama onAdd com nome vazio", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<ItemForm onAdd={onAdd} />);

  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(onAdd).not.toHaveBeenCalled();
});

it("chama onAdd com os valores informados e limpa o formulário", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn().mockResolvedValue();
  render(<ItemForm onAdd={onAdd} />);

  await user.type(screen.getByLabelText("Nome"), "Caneta");
  await user.type(screen.getByLabelText("Descrição"), "Azul");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(onAdd).toHaveBeenCalledWith({ name: "Caneta", description: "Azul" });
  await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue(""));
  expect(screen.getByLabelText("Descrição")).toHaveValue("");
});

it("mantém os campos e mostra o erro quando onAdd rejeita", async () => {
  const user = userEvent.setup();
  const onAdd = vi
    .fn()
    .mockRejectedValue(new Error("Já existe um item com esse nome"));
  render(<ItemForm onAdd={onAdd} />);

  await user.type(screen.getByLabelText("Nome"), "Caneta");
  await user.type(screen.getByLabelText("Descrição"), "Azul");
  await user.click(screen.getByRole("button", { name: "Adicionar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um item com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue("Caneta");
  expect(screen.getByLabelText("Descrição")).toHaveValue("Azul");
});
