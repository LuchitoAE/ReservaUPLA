// Interruptor de encendido y apagado (diseño S15): un botón con role="switch" que el lector de pantalla anuncia como
// «activado» o «desactivado», con su etiqueta y su descripción. El estado se dice también con texto, no solo con la
// posición o el color (WCAG 1.4.1), y todo el control mide 44 px de alto.
export function Interruptor({ id, etiqueta, descripcion, activo, onCambiar }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p id={`${id}-etiqueta`} className="font-semibold text-texto">
          {etiqueta}
        </p>
        <p id={`${id}-descripcion`} className="text-sm text-texto-suave">
          {descripcion}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-labelledby={`${id}-etiqueta`}
        aria-describedby={`${id}-descripcion`}
        onClick={() => onCambiar(!activo)}
        className="inline-flex min-h-11 shrink-0 items-center gap-3 self-start rounded-lg px-1 focus-visible:outline-3 focus-visible:outline-foco sm:self-auto"
      >
        <span
          aria-hidden="true"
          className={`relative h-7 w-12 rounded-full border transition ${activo ? 'border-marca-700 bg-marca-700' : 'border-borde-control bg-superficie-tenue'}`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full shadow transition-all motion-reduce:transition-none ${activo ? 'left-6 bg-white' : 'left-0.5 bg-borde-control'}`}
          />
        </span>
        <span className="w-24 text-left font-semibold text-texto">{activo ? 'Encendido' : 'Apagado'}</span>
      </button>
    </div>
  )
}
