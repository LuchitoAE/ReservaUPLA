import { ESTADOS_AMBIENTE } from '../../utils/formato'

// Ambiente cuya agenda se muestra (RF-13, diseño R01). Cada botón dice también si el ambiente no está disponible, para
// que se entienda por qué no recibe reservas nuevas.
export function SelectorDeAmbiente({ ambientes, elegido, alElegir }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Ambiente">
      {ambientes.map((ambiente) => {
        const activo = ambiente.id_ambiente === elegido.id_ambiente
        return (
          <button
            key={ambiente.id_ambiente}
            type="button"
            aria-pressed={activo}
            onClick={() => alElegir(ambiente.id_ambiente)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold transition focus-visible:outline-3 focus-visible:outline-foco ${activo ? 'border-marca-700 bg-marca-700 text-white' : 'border-borde-control bg-superficie text-texto hover:bg-superficie-tenue'}`}
          >
            {ambiente.nombre_ambiente}
            {ambiente.estado_ambiente !== 'Disponible' && (
              <span className="rounded-full bg-pendiente-fondo px-2 py-0.5 text-xs text-pendiente-texto">
                {ESTADOS_AMBIENTE[ambiente.estado_ambiente]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
