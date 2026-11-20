import { useState } from "react";
import { buttonPrimary, buttonSecondary } from "../ui";
import { actorSchema } from "../validation/actor";
import { useValidatedForm } from "../validation/useValidatedForm";
import FormField from "./FormField";
import Notice from "./Notice";

export const EMPTY_ACTOR = { name: "", birth_date: "", nationality: "" };

export default function ActorForm({
  initialValues = EMPTY_ACTOR,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const form = useValidatedForm(actorSchema, initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    if (!(await form.validate())) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: form.values.name.trim(),
        birth_date: form.values.birth_date || null,
        nationality: form.values.nationality.trim() || null,
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
      <FormField
        label="Nome"
        name="name"
        value={form.values.name}
        onChange={form.handleChange("name")}
        onBlur={form.handleBlur("name")}
        error={form.errors.name}
      />
      <FormField
        label="Data de nascimento"
        name="birth_date"
        type="date"
        value={form.values.birth_date}
        onChange={form.handleChange("birth_date")}
        onBlur={form.handleBlur("birth_date")}
        error={form.errors.birth_date}
      />
      <FormField
        label="Nacionalidade"
        name="nationality"
        value={form.values.nationality}
        onChange={form.handleChange("nationality")}
        onBlur={form.handleBlur("nationality")}
        error={form.errors.nationality}
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
