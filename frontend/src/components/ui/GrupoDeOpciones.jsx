// Opciones visibles, cada una con lo que significa (reconocer antes que recordar): para pocas opciones es mejor que
// una lista desplegable, que esconde las alternativas. Cada opción es una tarjeta entera que se puede pulsar
// (significante claro y área grande) y la elegida se marca con borde, fondo y el círculo del radio.
// «onSalir» avisa cuando el foco deja el grupo completo, no al pasar de una opción a otra.
export function GrupoDeOpciones({ id, etiqueta, obligatorio, error, valor, onCambiar, onSalir, opciones }) {
  const idError = error ? `${id}-error` : undefined

  function salir(evento) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) {
      onSalir?.()
    }
  }

  return (
    <fieldset id={id} tabIndex={-1} aria-describedby={idError} onBlur={salir} className="flex flex-col gap-1.5 focus:outline-none">
      <legend className="mb-1.5 font-semibold text-texto">
        {etiqueta}
        {obligatorio && (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {opciones.map((opcion) => (
          <label
            key={opcion.valor}
            className={`flex min-h-11 cursor-pointer gap-2.5 rounded-lg border bg-superficie p-3 transition hover:border-borde-control has-[:checked]:border-foco has-[:checked]:bg-seleccion has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-foco/30 ${error ? 'border-error' : 'border-borde-fuerte'}`}
          >
            <input
              type="radio"
              name={id}
              value={opcion.valor}
              checked={valor === opcion.valor}
              onChange={() => onCambiar(opcion.valor)}
              aria-invalid={Boolean(error)}
              className="mt-0.5 size-4 shrink-0 accent-foco"
            />
            <span className="flex flex-col">
              <span className="font-semibold">{opcion.etiqueta}</span>
              {opcion.descripcion && <span className="text-sm text-texto-suave">{opcion.descripcion}</span>}
            </span>
          </label>
        ))}
      </div>
      {/* La línea del error ocupa su lugar aunque esté vacía (RNF-04): el error no empuja lo que sigue. */}
      <div className="min-h-5 text-sm">
        {error && (
          <p id={idError} className="flex gap-1.5 font-medium text-error">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    </fieldset>
  )
}
