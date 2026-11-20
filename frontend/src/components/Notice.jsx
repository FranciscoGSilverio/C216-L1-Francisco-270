const styles = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
};

export default function Notice({ type = "info", children }) {
  const role = type === "error" ? "alert" : "status";
  return (
    <p
      role={role}
      className={`rounded border px-3 py-2 text-sm ${styles[type]}`}
    >
      {children}
    </p>
  );
}
