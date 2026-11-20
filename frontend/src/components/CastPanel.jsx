import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  addCastMember,
  removeCastMember,
  updateCastMember,
} from "../services/cast";
import {
  buttonPrimary,
  card,
  iconButton,
  iconButtonDanger,
  input,
  REQUIRED_MARK,
  requiredNote,
} from "../ui";
import { castSchema, characterSchema } from "../validation/cast";
import { useValidatedForm } from "../validation/useValidatedForm";
import ConfirmDialog from "./ConfirmDialog";
import FormField from "./FormField";
import Notice from "./Notice";

function CastRow({ member, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const form = useValidatedForm(characterSchema, {
    character: member.character,
  });

  async function save(event) {
    event.preventDefault();
    if (!(await form.validate())) return;
    const saved = await onSave(member.actor_id, form.values.character.trim());
    if (saved) setEditing(false);
  }

  function cancel() {
    form.reset({ character: member.character });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={save} noValidate className="flex items-start gap-2">
          <div className="flex-1">
            <label
              htmlFor={`character-${member.actor_id}`}
              className={`mb-1 block text-sm font-medium text-slate-700 ${REQUIRED_MARK}`}
            >
              Personagem de {member.actor_name}
            </label>
            <input
              id={`character-${member.actor_id}`}
              className={input}
              value={form.values.character}
              onChange={form.handleChange("character")}
              onBlur={form.handleBlur("character")}
              aria-required="true"
              aria-invalid={form.errors.character ? "true" : undefined}
            />
            {form.errors.character && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.character}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`${iconButton} mt-6`}
            aria-label={`Salvar personagem de ${member.actor_name}`}
          >
            <Check size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${iconButton} mt-6`}
            aria-label="Cancelar edição do personagem"
            onClick={cancel}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-3">
      <p className="text-slate-900">
        <span className="font-medium">{member.actor_name}</span>
        <span className="text-slate-500"> como {member.character}</span>
      </p>
      <div className="flex gap-1">
        <button
          type="button"
          className={iconButton}
          aria-label={`Editar personagem de ${member.actor_name}`}
          onClick={() => setEditing(true)}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={iconButtonDanger}
          aria-label={`Remover ${member.actor_name} do elenco`}
          onClick={() => onRemove(member)}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default function CastPanel({ movieId, cast, actors, onChanged }) {
  const form = useValidatedForm(castSchema, { actor_id: "", character: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const linkedIds = new Set(cast.map((member) => member.actor_id));
  const available = actors.filter((actor) => !linkedIds.has(actor.id));

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    if (!(await form.validate())) return;

    setSubmitting(true);
    try {
      await addCastMember(movieId, {
        actor_id: Number(form.values.actor_id),
        character: form.values.character.trim(),
      });
      form.reset();
      onChanged("Ator vinculado ao filme.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(actorId, character) {
    setError("");
    try {
      await updateCastMember(movieId, actorId, { character });
      onChanged("Personagem atualizado.");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function confirmRemove() {
    setRemoving(true);
    try {
      await removeCastMember(movieId, pendingRemove.actor_id);
      onChanged("Ator removido do elenco.");
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(false);
      setPendingRemove(null);
    }
  }

  return (
    <section className={`${card} space-y-4`} aria-label="Elenco">
      <h3 className="text-lg font-semibold text-slate-900">Elenco</h3>

      {error && <Notice type="error">{error}</Notice>}

      {cast.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum ator no elenco.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {cast.map((member) => (
            <CastRow
              key={member.actor_id}
              member={member}
              onSave={handleSave}
              onRemove={setPendingRemove}
            />
          ))}
        </ul>
      )}

      <div className="border-t border-slate-200 pt-4">
        <h4 className="mb-3 font-medium text-slate-900">Adicionar ao elenco</h4>
        <p className={`mb-3 ${requiredNote}`}>
          Campos marcados com * são obrigatórios.
        </p>
        {actors.length === 0 ? (
          <Notice type="info">
            Cadastre atores para montar o elenco.{" "}
            <Link to="/atores/novo" className="underline">
              Novo ator
            </Link>
          </Notice>
        ) : available.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todos os atores cadastrados já estão no elenco.
          </p>
        ) : (
          <form onSubmit={handleAdd} noValidate className="space-y-3">
            <FormField
              label="Ator"
              name="actor_id"
              required
              as="select"
              value={form.values.actor_id}
              onChange={form.handleChange("actor_id")}
              onBlur={form.handleBlur("actor_id")}
              error={form.errors.actor_id}
            >
              <option value="">Selecione um ator</option>
              {available.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </FormField>
            <FormField
              label="Personagem"
              name="character"
              required
              value={form.values.character}
              onChange={form.handleChange("character")}
              onBlur={form.handleBlur("character")}
              error={form.errors.character}
            />
            <button
              type="submit"
              className={buttonPrimary}
              disabled={submitting}
            >
              <Plus size={16} aria-hidden="true" /> Adicionar
            </button>
          </form>
        )}
      </div>

      {pendingRemove && (
        <ConfirmDialog
          title="Remover do elenco"
          message={`Remover ${pendingRemove.actor_name} do elenco? Esta ação não pode ser desfeita.`}
          busy={removing}
          onConfirm={confirmRemove}
          onCancel={() => setPendingRemove(null)}
        />
      )}
    </section>
  );
}
