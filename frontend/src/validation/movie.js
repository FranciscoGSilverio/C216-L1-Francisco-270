import * as yup from "yup";

export const MIN_YEAR = 1888;
const YEARS_AHEAD = 5;

export function maxYear() {
  return new Date().getFullYear() + YEARS_AHEAD;
}

export const movieSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Informe o título do filme.")
    .max(200, "O título deve ter no máximo 200 caracteres."),
  year: yup
    .number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Informe um ano válido.")
    .required("Informe o ano do filme.")
    .integer("O ano deve ser um número inteiro.")
    .min(MIN_YEAR, `O ano deve ser no mínimo ${MIN_YEAR}.`)
    .test(
      "max-year",
      () => `O ano deve ser no máximo ${maxYear()}.`,
      (value) => value === undefined || value <= maxYear(),
    ),
  genre: yup
    .string()
    .trim()
    .max(60, "O gênero deve ter no máximo 60 caracteres."),
  synopsis: yup
    .string()
    .trim()
    .max(2000, "A sinopse deve ter no máximo 2000 caracteres."),
});
