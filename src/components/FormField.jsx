/** Bọc label + input + lỗi validation. `error` là object lỗi của React Hook Form. */
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error && <p className="text-error">{error.message}</p>}
    </div>
  );
}
