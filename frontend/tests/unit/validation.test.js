import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, validateItem } from "../../src/validation";

describe("validateItem", () => {
  it("rejeita nome vazio ou só com espaços", () => {
    const { errors } = validateItem({ name: "   ", description: "" });
    expect(errors.name).toBeDefined();
  });

  it("rejeita nome com mais de 100 caracteres", () => {
    const { errors } = validateItem({
      name: "a".repeat(NAME_MAX_LENGTH + 1),
      description: "",
    });
    expect(errors.name).toBeDefined();
  });

  it("aceita um nome válido e remove espaços nas extremidades", () => {
    const { errors, values } = validateItem({
      name: "  Caneta  ",
      description: "  Azul  ",
    });
    expect(errors.name).toBeUndefined();
    expect(values).toEqual({ name: "Caneta", description: "Azul" });
  });

  it("aceita descrição vazia", () => {
    const { errors, values } = validateItem({
      name: "Caneta",
      description: "",
    });
    expect(errors.name).toBeUndefined();
    expect(values.description).toBe("");
  });
});
