import * as yup from "yup";

export const characterSchema = yup.object({
  character: yup
    .string()
    .trim()
    .required("Informe o personagem.")
    .max(150, "O personagem deve ter no máximo 150 caracteres."),
});

export const castSchema = characterSchema.shape({
  actor_id: yup.string().required("Selecione um ator."),
});
