import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MovieForm from "../components/MovieForm";
import Notice from "../components/Notice";
import { getMovie, replaceMovie } from "../services/movies";
import { card } from "../ui";

export default function MovieEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getMovie(id)
      .then((data) => {
        if (!ignore) setMovie(data);
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
  }, [id]);

  async function handleSubmit(values) {
    await replaceMovie(id, values);
    navigate(`/filmes/${id}`, {
      state: { notice: "Filme atualizado com sucesso." },
    });
  }

  return (
    <section className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Editar filme</h2>
      {loading && <p className="text-sm text-slate-500">Carregando filme...</p>}
      {error && (
        <>
          <Notice type="error">{error}</Notice>
          <Link to="/filmes" className="text-sm text-blue-700 underline">
            Voltar para os filmes
          </Link>
        </>
      )}
      {movie && (
        <MovieForm
          initialValues={{
            title: movie.title,
            year: String(movie.year),
            genre: movie.genre ?? "",
            synopsis: movie.synopsis ?? "",
          }}
          submitLabel="Salvar"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/filmes/${id}`)}
        />
      )}
    </section>
  );
}
