import { input } from "../ui";

export default function FormField({
  label,
  name,
  error,
  as = "input",
  children,
  ...props
}) {
  const id = `field-${name}`;
  const Control = as;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <Control
        id={id}
        name={name}
        className={input}
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
