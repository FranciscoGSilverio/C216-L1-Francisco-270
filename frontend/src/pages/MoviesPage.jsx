import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Notice from "../components/Notice";
import { deleteMovie, listMovies } from "../services/movies";
import {
  buttonPrimary,
  card,
  iconButton,
  iconButtonDanger,
  input,
} from "../ui";

export default function MoviesPage() {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
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
    listMovies({ title: search.trim() })
      .then((data) => {
        if (ignore) return;
        setMovies(data);
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
      await deleteMovie(pendingDelete.id);
      setNotice("Filme excluído com sucesso.");
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
        <h2 className="text-lg font-semibold text-slate-900">Filmes</h2>
        <Link to="/filmes/novo" className={buttonPrimary}>
          <Plus size={16} aria-hidden="true" /> Novo filme
        </Link>
      </div>

      <input
        type="search"
        aria-label="Buscar filme por título"
        placeholder="Buscar por título"
        className={input}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {notice && <Notice type="success">{notice}</Notice>}
      {error && <Notice type="error">{error}</Notice>}

      {loading && (
        <p className="text-sm text-slate-500">Carregando filmes...</p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum filme cadastrado.</p>
      )}

      <ul className="divide-y divide-slate-200">
        {movies.map((movie) => (
          <li key={movie.id} className="flex items-center justify-between py-3">
            <div>
              <Link
                to={`/filmes/${movie.id}`}
                className="font-medium text-blue-700 hover:underline"
              >
                {movie.title}
              </Link>
              <p className="text-sm text-slate-500">
                {[movie.year, movie.genre].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                to={`/filmes/${movie.id}/editar`}
                className={iconButton}
                aria-label={`Editar filme ${movie.title}`}
              >
                <Pencil size={16} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className={iconButtonDanger}
                aria-label={`Excluir filme ${movie.title}`}
                onClick={() => setPendingDelete(movie)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <ConfirmDialog
          title="Excluir filme"
          message={`Excluir ${pendingDelete.title}? Esta ação não pode ser desfeita.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
