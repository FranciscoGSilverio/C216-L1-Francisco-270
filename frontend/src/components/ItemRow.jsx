import { useId, useState } from "react";
import { validateItem } from "../validation";

const BUTTON = "rounded border border-slate-300 px-3 py-1 text-sm";

export function ItemRow({ item, onEdit, onDelete }) {
  const baseId = useId();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setName(item.name);
    setDescription(item.description ?? "");
    setErrors({});
    setSubmitError("");
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    const result = validateItem({ name, description });
    setErrors(result.errors);
    setSubmitError("");
    if (Object.keys(result.errors).length > 0) return;

    setSaving(true);
    try {
      await onEdit(item.id, result.values);
      setEditing(false);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSave} noValidate className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor={`${baseId}-name`}
              className="block text-sm font-medium"
            >
              Nome
            </label>
            <input
              id={`${baseId}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-slate-300 p-2"
            />
            {errors.name && (
              <p role="alert" className="text-sm text-red-700">
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label
              htmlFor={`${baseId}-description`}
              className="block text-sm font-medium"
            >
              Descrição
            </label>
            <textarea
              id={`${baseId}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 p-2"
            />
          </div>
          {submitError && (
            <p role="alert" className="text-sm text-red-700">
              {submitError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={BUTTON}
            >
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium">{item.name}</p>
        {item.description && (
          <p className="text-sm text-slate-600">{item.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          aria-label={`Editar ${item.name}`}
          onClick={startEditing}
          className={BUTTON}
        >
          Editar
        </button>
        <button
          type="button"
          aria-label={`Excluir ${item.name}`}
          onClick={() => onDelete(item.id)}
          className={`${BUTTON} text-red-700`}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}
