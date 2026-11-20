import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActorForm from "../components/ActorForm";
import Notice from "../components/Notice";
import { getActor, replaceActor } from "../services/actors";
import { card } from "../ui";

export default function ActorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getActor(id)
      .then((data) => {
        if (!ignore) setActor(data);
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
    await replaceActor(id, values);
    navigate("/atores", {
      state: { notice: "Ator atualizado com sucesso." },
    });
  }

  return (
    <section className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Editar ator</h2>
      {loading && <p className="text-sm text-slate-500">Carregando ator...</p>}
      {error && (
        <>
          <Notice type="error">{error}</Notice>
          <Link to="/atores" className="text-sm text-blue-700 underline">
            Voltar para os atores
          </Link>
        </>
      )}
      {actor && (
        <ActorForm
          initialValues={{
            name: actor.name,
            birth_date: actor.birth_date ?? "",
            nationality: actor.nationality ?? "",
          }}
          submitLabel="Salvar"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/atores")}
        />
      )}
    </section>
  );
}
