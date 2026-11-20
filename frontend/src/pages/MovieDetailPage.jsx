import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CastPanel from "../components/CastPanel";
import ConfirmDialog from "../components/ConfirmDialog";
import Notice from "../components/Notice";
import { listActors } from "../services/actors";
import { deleteMovie, getMovie } from "../services/movies";
import { card, iconButton, iconButtonDanger } from "../ui";

export default function MovieDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice ?? "");
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey só força o recarregamento depois de uma alteração
  useEffect(() => {
    let ignore = false;
    Promise.all([getMovie(id), listActors()])
      .then(([movieData, actorsData]) => {
        if (ignore) return;
        setMovie(movieData);
        setActors(actorsData);
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
  }, [id, reloadKey]);

  function handleCastChanged(message) {
    setNotice(message);
    setReloadKey((key) => key + 1);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteMovie(id);
      navigate("/filmes", { state: { notice: "Filme excluído com sucesso." } });
    } catch (err) {
      setNotice("");
      setError(err.message);
      setConfirmingDelete(false);
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Carregando filme...</p>;
  }

  if (!movie) {
    return (
      <section className={`${card} space-y-3`}>
        <Notice type="error">{error}</Notice>
        <Link to="/filmes" className="text-sm text-blue-700 underline">
          Voltar para os filmes
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className={`${card} space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {movie.title}
            </h2>
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
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        {movie.synopsis && <p className="text-slate-700">{movie.synopsis}</p>}
        {notice && <Notice type="success">{notice}</Notice>}
        {error && <Notice type="error">{error}</Notice>}
      </section>

      <CastPanel
        movieId={movie.id}
        cast={movie.cast}
        actors={actors}
        onChanged={handleCastChanged}
      />

      {confirmingDelete && (
        <ConfirmDialog
          title="Excluir filme"
          message={`Excluir ${movie.title}? Esta ação não pode ser desfeita.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
