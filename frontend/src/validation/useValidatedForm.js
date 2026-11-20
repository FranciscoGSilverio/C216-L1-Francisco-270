import { useState } from "react";
import { validateAll, validateField } from "./index";

// Estado próprio de cada formulário que o chama: valores, erros e campos tocados.
// O erro de um campo só aparece depois do blur (ou do envio).
export function useValidatedForm(schema, initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  async function setFieldError(field, nextValues) {
    const message = await validateField(schema, field, nextValues);
    setErrors((current) => ({ ...current, [field]: message }));
  }

  function handleChange(field) {
    return (event) => {
      const nextValues = { ...values, [field]: event.target.value };
      setValues(nextValues);
      if (touched[field]) setFieldError(field, nextValues);
    };
  }

  function handleBlur(field) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }));
      return setFieldError(field, values);
    };
  }

  async function validate() {
    const found = await validateAll(schema, values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    return Object.keys(found).length === 0;
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues);
    setErrors({});
    setTouched({});
  }

  return { values, errors, handleChange, handleBlur, validate, reset };
}
