import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ItemRow } from "../../src/components/ItemRow";

const item = { id: 4, name: "Notebook", description: "14 polegadas" };

function setup(props = {}) {
  const onEdit = vi.fn().mockResolvedValue();
  const onDelete = vi.fn();
  const user = userEvent.setup();
  render(
    <ul>
      <ItemRow item={item} onEdit={onEdit} onDelete={onDelete} {...props} />
    </ul>,
  );
  return { user, onEdit, onDelete };
}

it("Editar mostra os campos preenchidos", async () => {
  const { user } = setup();

  await user.click(screen.getByRole("button", { name: "Editar Notebook" }));

  expect(screen.getByLabelText("Nome")).toHaveValue("Notebook");
  expect(screen.getByLabelText("Descrição")).toHaveValue("14 polegadas");
});

it("Salvar com nome vazio mostra o erro e não chama onEdit", async () => {
  const { user, onEdit } = setup();
  await user.click(screen.getByRole("button", { name: "Editar Notebook" }));

  await user.clear(screen.getByLabelText("Nome"));
  await user.click(screen.getByRole("button", { name: "Salvar" }));

  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(onEdit).not.toHaveBeenCalled();
});

it("Salvar válido chama onEdit e volta ao modo leitura", async () => {
  const { user, onEdit } = setup();
  await user.click(screen.getByRole("button", { name: "Editar Notebook" }));

  await user.clear(screen.getByLabelText("Nome"));
  await user.type(screen.getByLabelText("Nome"), "Tablet");
  await user.click(screen.getByRole("button", { name: "Salvar" }));

  expect(onEdit).toHaveBeenCalledWith(4, {
    name: "Tablet",
    description: "14 polegadas",
  });
  expect(
    await screen.findByRole("button", { name: "Editar Notebook" }),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
});

it("mantém o modo edição com a mensagem quando onEdit rejeita", async () => {
  const { user } = setup({
    onEdit: vi
      .fn()
      .mockRejectedValue(new Error("Já existe um item com esse nome")),
  });
  await user.click(screen.getByRole("button", { name: "Editar Notebook" }));

  await user.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um item com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toBeInTheDocument();
});

it("Cancelar volta sem chamar onEdit", async () => {
  const { user, onEdit } = setup();
  await user.click(screen.getByRole("button", { name: "Editar Notebook" }));

  await user.type(screen.getByLabelText("Nome"), " X");
  await user.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(onEdit).not.toHaveBeenCalled();
  expect(screen.getByText("Notebook")).toBeInTheDocument();
});

it("Excluir chama onDelete com o id", async () => {
  const { user, onDelete } = setup();

  await user.click(screen.getByRole("button", { name: "Excluir Notebook" }));

  expect(onDelete).toHaveBeenCalledWith(4);
});
