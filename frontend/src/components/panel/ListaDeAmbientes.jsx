import { ESTADOS_AMBIENTE } from '../../utils/formato'
import { EtiquetaDeEstado } from '../ui/EtiquetaDeEstado'

// Los ambientes y si se pueden reservar (diseño S01): el solicitante ve de un vistazo dónde puede pedir. Los que no
// están disponibles lo dicen en la segunda línea, y la etiqueta dice «No disponible» en vez del estado interno.
export function ListaDeAmbientes({ ambientes }) {
  if (ambientes.length === 0) {
    return <p className="text-texto-suave">Todavía no hay ambientes registrados.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {ambientes.map((ambiente) => {
        const disponible = ambiente.estado_ambiente === 'Disponible'
        return (
          <li key={ambiente.id_ambiente} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-texto">{ambiente.nombre_ambiente}</p>
              <p className="text-sm text-texto-suave">
                {disponible
                  ? `${ambiente.capacidad_ambiente} personas · ${ambiente.ubicacion_ambiente}`
                  : ESTADOS_AMBIENTE[ambiente.estado_ambiente]}
              </p>
            </div>
            <span className="shrink-0">
              <EtiquetaDeEstado estado={disponible ? 'Disponible' : 'No disponible'} tono={disponible ? 'exito' : 'neutro'} />
              {!disponible && <span className="sr-only"> (no se puede reservar)</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
