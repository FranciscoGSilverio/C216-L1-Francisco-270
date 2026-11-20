import { input, REQUIRED_MARK } from "../ui";

export default function FormField({
  label,
  name,
  error,
  as = "input",
  required = false,
  children,
  ...props
}) {
  const id = `field-${name}`;
  const Control = as;
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1 block text-sm font-medium text-slate-700 ${
          required ? REQUIRED_MARK : ""
        }`}
      >
        {label}
      </label>
      <Control
        id={id}
        name={name}
        className={input}
        aria-required={required ? "true" : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Control>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
