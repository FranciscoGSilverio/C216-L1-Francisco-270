import { useNavigate } from "react-router-dom";
import MovieForm from "../components/MovieForm";
import { createMovie } from "../services/movies";
import { card } from "../ui";

export default function MovieCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const movie = await createMovie(values);
    navigate(`/filmes/${movie.id}`, {
      state: { notice: "Filme cadastrado com sucesso." },
    });
  }

  return (
    <section className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Novo filme</h2>
      <MovieForm
        submitLabel="Cadastrar"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/filmes")}
      />
    </section>
  );
}
