// Explica el asterisco una sola vez, al inicio del formulario.
export function NotaObligatorios() {
  return (
    <p className="text-sm text-texto-suave">
      Los campos con <span className="text-error">*</span> son obligatorios.
    </p>
  )
}
