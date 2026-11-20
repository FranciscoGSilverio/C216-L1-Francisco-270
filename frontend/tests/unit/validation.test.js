import { expect, it } from "vitest";
import { validateAll, validateField } from "../../src/validation";
import { actorSchema } from "../../src/validation/actor";
import { castSchema, characterSchema } from "../../src/validation/cast";
import { maxYear, movieSchema } from "../../src/validation/movie";

const validMovie = {
  title: "Cidade de Deus",
  year: "2002",
  genre: "",
  synopsis: "",
};

it("ator: nome só com espaços é inválido", async () => {
  const message = await validateField(actorSchema, "name", { name: "   " });
  expect(message).toBe("Informe o nome do ator.");
});

it("ator: nome com mais de 150 caracteres é inválido", async () => {
  const message = await validateField(actorSchema, "name", {
    name: "a".repeat(151),
  });
  expect(message).toBe("O nome deve ter no máximo 150 caracteres.");
});

it("ator: nascimento futuro é inválido e vazio é aceito", async () => {
  const future = `${new Date().getFullYear() + 1}-01-01`;
  expect(
    await validateField(actorSchema, "birth_date", { birth_date: future }),
  ).toBe("A data de nascimento não pode ser futura.");
  expect(
    await validateField(actorSchema, "birth_date", { birth_date: "" }),
  ).toBe("");
});

it("ator: nacionalidade com mais de 80 caracteres é inválida", async () => {
  const message = await validateField(actorSchema, "nationality", {
    nationality: "n".repeat(81),
  });
  expect(message).toBe("A nacionalidade deve ter no máximo 80 caracteres.");
});

it("filme: título vazio é inválido", async () => {
  const message = await validateField(movieSchema, "title", { title: "" });
  expect(message).toBe("Informe o título do filme.");
});

it("filme: ano 1887 é inválido e 1888 é aceito", async () => {
  expect(await validateField(movieSchema, "year", { year: "1887" })).toBe(
    "O ano deve ser no mínimo 1888.",
  );
  expect(await validateField(movieSchema, "year", { year: "1888" })).toBe("");
});

it("filme: ano acima do limite é inválido e o limite é aceito", async () => {
  const over = String(maxYear() + 1);
  expect(await validateField(movieSchema, "year", { year: over })).toBe(
    `O ano deve ser no máximo ${maxYear()}.`,
  );
  expect(
    await validateField(movieSchema, "year", { year: String(maxYear()) }),
  ).toBe("");
});

it("filme: ano vazio, texto e decimal são inválidos", async () => {
  expect(await validateField(movieSchema, "year", { year: "" })).toBe(
    "Informe o ano do filme.",
  );
  expect(await validateField(movieSchema, "year", { year: "abc" })).toBe(
    "Informe um ano válido.",
  );
  expect(await validateField(movieSchema, "year", { year: "2000.5" })).toBe(
    "O ano deve ser um número inteiro.",
  );
});

it("filme: sinopse acima de 2000 caracteres é inválida", async () => {
  const message = await validateField(movieSchema, "synopsis", {
    synopsis: "s".repeat(2001),
  });
  expect(message).toBe("A sinopse deve ter no máximo 2000 caracteres.");
});

it("elenco: personagem e ator são obrigatórios", async () => {
  expect(
    await validateField(characterSchema, "character", { character: " " }),
  ).toBe("Informe o personagem.");
  expect(await validateField(castSchema, "actor_id", { actor_id: "" })).toBe(
    "Selecione um ator.",
  );
});

it("validateAll devolve um erro por campo e vazio quando válido", async () => {
  expect(await validateAll(movieSchema, validMovie)).toEqual({});

  const errors = await validateAll(movieSchema, {
    ...validMovie,
    title: "",
    year: "",
  });
  expect(Object.keys(errors).sort()).toEqual(["title", "year"]);
});
