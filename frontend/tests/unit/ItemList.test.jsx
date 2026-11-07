import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ItemList } from "../../src/components/ItemList";

it("mostra a mensagem de lista vazia quando não há itens", () => {
  render(<ItemList items={[]} />);

  expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
});

it("renderiza nome e descrição de cada item", () => {
  render(
    <ItemList
      items={[
        { id: "1", name: "Caneta", description: "Azul" },
        { id: "2", name: "Caderno", description: "" },
      ]}
    />,
  );

  expect(screen.getByText("Caneta")).toBeInTheDocument();
  expect(screen.getByText("Azul")).toBeInTheDocument();
  expect(screen.getByText("Caderno")).toBeInTheDocument();
});

it("repassa onEdit e onDelete para cada linha", async () => {
  const onDelete = vi.fn();
  render(
    <ItemList
      items={[{ id: 1, name: "Caneta", description: "" }]}
      onEdit={vi.fn()}
      onDelete={onDelete}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: "Excluir Caneta" }));

  expect(onDelete).toHaveBeenCalledWith(1);
});
