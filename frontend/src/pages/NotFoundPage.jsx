import { Link } from "react-router-dom";
import { card } from "../ui";

export default function NotFoundPage() {
  return (
    <section className={`${card} space-y-2`}>
      <h2 className="text-lg font-semibold text-slate-900">
        Página não encontrada
      </h2>
      <Link to="/filmes" className="text-sm text-blue-700 underline">
        Ir para os filmes
      </Link>
    </section>
  );
}
