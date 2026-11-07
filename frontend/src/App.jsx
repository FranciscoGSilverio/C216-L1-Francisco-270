import { useEffect, useState } from "react";
import { ItemForm } from "./components/ItemForm";
import { ItemList } from "./components/ItemList";
import {
  createItem,
  deleteItem,
  listItems,
  replaceItem,
} from "./services/items";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    listItems()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // O erro é repropagado para o formulário, que o exibe e mantém os campos.
  async function addItem(values) {
    const created = await createItem(values);
    setItems((current) => [...current, created]);
  }

  async function editItem(id, values) {
    const updated = await replaceItem(id, values);
    setItems((current) => current.map((i) => (i.id === id ? updated : i)));
  }

  async function removeItem(id) {
    setActionError("");
    try {
      await deleteItem(id);
      setItems((current) => current.filter((i) => i.id !== id));
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-6 p-4 sm:p-6">
      <h1 className="text-3xl font-bold">Gerenciador de Itens</h1>
      <ItemForm onAdd={addItem} />
      <section aria-labelledby="items-heading" className="space-y-3">
        <h2 id="items-heading" className="text-xl font-semibold">
          Itens cadastrados
        </h2>
        {loading && (
          <p role="status" className="text-slate-600">
            Carregando itens...
          </p>
        )}
        {loadError && (
          <p role="alert" className="text-red-700">
            {loadError}
          </p>
        )}
        {actionError && (
          <p role="alert" className="text-red-700">
            {actionError}
          </p>
        )}
        {!loading && !loadError && (
          <ItemList items={items} onEdit={editItem} onDelete={removeItem} />
        )}
      </section>
    </main>
  );
}
