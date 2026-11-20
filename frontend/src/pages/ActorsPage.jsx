import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Notice from "../components/Notice";
import { deleteActor, listActors } from "../services/actors";
import {
  buttonPrimary,
  card,
  iconButton,
  iconButtonDanger,
  input,
} from "../ui";

function formatDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default function ActorsPage() {
  const location = useLocation();
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice ?? "");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey só força o recarregamento depois de uma alteração
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    listActors(search.trim())
      .then((data) => {
        if (ignore) return;
        setActors(data);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [search, reloadKey]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteActor(pendingDelete.id);
      setNotice("Ator excluído com sucesso.");
      setError("");
      setReloadKey((key) => key + 1);
    } catch (err) {
      setNotice("");
      setError(err.message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <section className={`${card} space-y-4`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Atores</h2>
        <Link to="/atores/novo" className={buttonPrimary}>
          <Plus size={16} aria-hidden="true" /> Novo ator
        </Link>
      </div>

      <input
        type="search"
        aria-label="Buscar ator por nome"
        placeholder="Buscar por nome"
        className={input}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {notice && <Notice type="success">{notice}</Notice>}
      {error && <Notice type="error">{error}</Notice>}

      {loading && (
        <p className="text-sm text-slate-500">Carregando atores...</p>
      )}

      {!loading && !error && actors.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum ator cadastrado.</p>
      )}

      <ul className="divide-y divide-slate-200">
        {actors.map((actor) => (
          <li key={actor.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">{actor.name}</p>
              <p className="text-sm text-slate-500">
                {[actor.nationality, formatDate(actor.birth_date)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                to={`/atores/${actor.id}/editar`}
                className={iconButton}
                aria-label={`Editar ator ${actor.name}`}
              >
                <Pencil size={16} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className={iconButtonDanger}
                aria-label={`Excluir ator ${actor.name}`}
                onClick={() => setPendingDelete(actor)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <ConfirmDialog
          title="Excluir ator"
          message={`Excluir ${pendingDelete.name}? Esta ação não pode ser desfeita.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
