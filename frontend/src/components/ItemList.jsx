import { ItemRow } from "./ItemRow";

export function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <p className="text-slate-600">Nenhum item cadastrado.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
