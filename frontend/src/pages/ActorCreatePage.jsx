import { useNavigate } from "react-router-dom";
import ActorForm from "../components/ActorForm";
import { createActor } from "../services/actors";
import { card } from "../ui";

export default function ActorCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    await createActor(values);
    navigate("/atores", { state: { notice: "Ator cadastrado com sucesso." } });
  }

  return (
    <section className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Novo ator</h2>
      <ActorForm
        submitLabel="Cadastrar"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/atores")}
      />
    </section>
  );
}
