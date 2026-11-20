import { useState } from "react";
import { buttonPrimary, buttonSecondary, requiredNote } from "../ui";
import { movieSchema } from "../validation/movie";
import { useValidatedForm } from "../validation/useValidatedForm";
import FormField from "./FormField";
import Notice from "./Notice";

export const EMPTY_MOVIE = { title: "", year: "", genre: "", synopsis: "" };

export default function MovieForm({
  initialValues = EMPTY_MOVIE,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const form = useValidatedForm(movieSchema, initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    if (!(await form.validate())) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.values.title.trim(),
        year: Number(form.values.year),
        genre: form.values.genre.trim() || null,
        synopsis: form.values.synopsis.trim() || null,
      });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <Notice type="error">{apiError}</Notice>}
      <p className={requiredNote}>Campos marcados com * são obrigatórios.</p>
      <FormField
        label="Título"
        name="title"
        required
        value={form.values.title}
        onChange={form.handleChange("title")}
        onBlur={form.handleBlur("title")}
        error={form.errors.title}
      />
      <FormField
        label="Ano"
        name="year"
        required
        inputMode="numeric"
        value={form.values.year}
        onChange={form.handleChange("year")}
        onBlur={form.handleBlur("year")}
        error={form.errors.year}
      />
      <FormField
        label="Gênero"
        name="genre"
        value={form.values.genre}
        onChange={form.handleChange("genre")}
        onBlur={form.handleBlur("genre")}
        error={form.errors.genre}
      />
      <FormField
        label="Sinopse"
        name="synopsis"
        as="textarea"
        rows={4}
        value={form.values.synopsis}
        onChange={form.handleChange("synopsis")}
        onBlur={form.handleBlur("synopsis")}
        error={form.errors.synopsis}
      />
      <div className="flex gap-2">
        <button type="submit" className={buttonPrimary} disabled={submitting}>
          {submitLabel}
        </button>
        <button type="button" className={buttonSecondary} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
