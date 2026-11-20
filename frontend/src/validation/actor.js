import * as yup from "yup";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export const actorSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Informe o nome do ator.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  birth_date: yup
    .string()
    .test(
      "not-future",
      "A data de nascimento não pode ser futura.",
      (value) => !value || value <= todayIso(),
    ),
  nationality: yup
    .string()
    .trim()
    .max(80, "A nacionalidade deve ter no máximo 80 caracteres."),
});
