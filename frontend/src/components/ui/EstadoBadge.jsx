import { Icono } from './Icono'

// Insignia del estado de una reserva: color, ícono y nombre. El color nunca va solo (WCAG 1.4.1).
const ESTILOS = {
  Pendiente: 'bg-pendiente-fondo text-pendiente-texto',
  Aprobada: 'bg-aprobada-fondo text-aprobada-texto',
  Rechazada: 'bg-rechazada-fondo text-rechazada-texto',
  Cancelada: 'bg-cancelada-fondo text-cancelada-texto',
}

export function EstadoBadge({ estado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap ${ESTILOS[estado]}`}>
      <Icono nombre={estado.toLowerCase()} className="size-4" />
      {estado}
    </span>
  )
}
