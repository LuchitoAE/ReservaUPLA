import { formatearFechaDeMomento } from '../../utils/fechas'
import { Icono } from '../ui/Icono'
import { pasosDelHistorial } from './pasosDelHistorial'

// Color e ícono de cada paso, con el semáforo de los estados (RNF-05): el color nunca va solo, lo acompañan el ícono
// y el nombre.
const APARIENCIA = {
  Registrada: { icono: 'nueva', estilo: 'bg-info-fondo text-info' },
  Pendiente: { icono: 'pendiente', estilo: 'bg-pendiente-fondo text-pendiente-texto' },
  Aprobada: { icono: 'aprobada', estilo: 'bg-aprobada-fondo text-aprobada-texto' },
  Rechazada: { icono: 'rechazada', estilo: 'bg-rechazada-fondo text-rechazada-texto' },
  Cancelada: { icono: 'cancelada', estilo: 'bg-cancelada-fondo text-cancelada-texto' },
}

// RF-06: por qué estados pasó la reserva, cuándo y quién hizo cada cambio (diseño AD08), del más antiguo al actual.
export function HistorialDeReserva({ historial }) {
  const pasos = pasosDelHistorial(historial)

  return (
    <section aria-labelledby="titulo-historial" className="rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <Icono nombre="pendiente" className="size-5 text-foco" />
        <h2 id="titulo-historial" className="text-lg font-semibold text-titulo">
          Historial
        </h2>
      </div>
      <ol className="flex flex-col gap-4">
        {pasos.map((paso) => {
          const { icono, estilo } = APARIENCIA[paso.estado]
          // Si la reserva sigue pendiente, el diseño no repite la fecha ni el autor del registro: solo «Estado actual».
          const pendienteActual = paso.actual && paso.estado === 'Pendiente'
          const detalle = [
            !pendienteActual && formatearFechaDeMomento(paso.fecha),
            paso.quien,
            paso.sinAutor && 'anterior al historial: no se registró quién lo hizo',
            paso.actual && 'estado actual',
          ].filter(Boolean)

          return (
            <li key={paso.clave} className="flex gap-3" aria-current={paso.actual ? 'step' : undefined}>
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${estilo}`}>
                <Icono nombre={icono} className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-texto">{paso.titulo}</p>
                <p className="text-sm text-texto-suave first-letter:uppercase">{detalle.join(' · ')}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
