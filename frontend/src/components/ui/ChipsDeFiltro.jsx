// Filtro por categoría en forma de chips con el conteo de cada opción (diseños S09, AD04, AD12 y AD15). Cada chip es
// un botón: dice qué filtra y cuántos registros hay ahí, así la persona sabe de antemano si vale la pena pulsarlo
// (reconocer antes que recordar, Nielsen). El chip activo se marca con color y con aria-pressed, no solo con color.
//   opciones: [{ valor, etiqueta, cantidad }], valor: el activo ('' = «Todos»).
export function ChipsDeFiltro({ etiqueta, opciones, valor, alCambiar }) {
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor
        return (
          <button
            key={opcion.valor || 'todos'}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion.valor)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold transition focus-visible:outline-3 focus-visible:outline-foco ${
              activo
                ? 'border-marca-700 bg-marca-700 text-white'
                : 'border-borde-control bg-superficie text-texto hover:bg-superficie-tenue'
            }`}
          >
            {opcion.etiqueta}
            <span
              className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-sm font-semibold tabular-nums ${
                activo ? 'bg-white/25 text-white' : 'bg-superficie-tenue text-texto-suave'
              }`}
            >
              {opcion.cantidad}
            </span>
          </button>
        )
      })}
    </div>
  )
}
