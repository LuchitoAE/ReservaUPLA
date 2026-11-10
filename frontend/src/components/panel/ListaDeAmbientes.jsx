import { ESTADOS_AMBIENTE } from '../../utils/formato'

const ESTILOS = {
  Disponible: 'bg-aprobada-fondo text-aprobada-texto',
  EnMantenimiento: 'bg-pendiente-fondo text-pendiente-texto',
  Inactivo: 'bg-cancelada-fondo text-cancelada-texto',
}

// Los ambientes y si se pueden reservar (diseño S01): el solicitante ve de un vistazo dónde puede pedir.
export function ListaDeAmbientes({ ambientes }) {
  if (ambientes.length === 0) {
    return <p className="text-texto-suave">Todavía no hay ambientes registrados.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {ambientes.map((ambiente) => (
        <li key={ambiente.id_ambiente} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-texto">{ambiente.nombre_ambiente}</p>
            <p className="text-sm text-texto-suave">
              {ambiente.capacidad_ambiente} personas · {ambiente.ubicacion_ambiente}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${ESTILOS[ambiente.estado_ambiente]}`}>
            {ESTADOS_AMBIENTE[ambiente.estado_ambiente]}
          </span>
        </li>
      ))}
    </ul>
  )
}
