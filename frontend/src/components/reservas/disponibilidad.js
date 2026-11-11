import { formatearFechaDelDia } from '../../utils/fechas'

// Estados y textos de la tarjeta de disponibilidad (diseño S04). El mensaje ocupa siempre el mismo alto (RNF-04) y
// lleva el semáforo de estados (RNF-05): libre en verde, ocupado en ámbar.
export const APARIENCIA = {
  espera: {
    tipo: 'info',
    titulo: 'Elija el ambiente, la fecha y las horas',
    texto: 'Aquí verá si el horario está libre y qué reservas tiene ese día.',
  },
  consultando: { tipo: 'info', titulo: 'Revisando la disponibilidad…', texto: 'Un momento.' },
  libre: { tipo: 'exito', titulo: 'Horario libre.' },
  ocupado: { tipo: 'aviso', titulo: 'Horario ocupado.' },
  error: { tipo: 'error', titulo: 'No se pudo revisar la disponibilidad' },
}

// Lo que dice la tarjeta según lo que respondió la API; el mensaje de la API manda cuando existe.
export function textoDeDisponibilidad({ estado, mensaje, solicitud }) {
  if (estado === 'libre' && solicitud) {
    return `De ${solicitud.inicio} a ${solicitud.fin} no hay reservas aprobadas en este ambiente.`
  }
  return mensaje ?? APARIENCIA[estado].texto
}

// La línea de tiempo solo se dibuja cuando hay algo que mostrar: las reservas del día o la solicitud en un horario libre.
export function hayLineaDeTiempo({ estado, reservasDelDia, solicitud }) {
  return (estado === 'libre' || estado === 'ocupado') && (reservasDelDia.length > 0 || (estado === 'libre' && Boolean(solicitud)))
}

// «ambiente · lunes 9 de noviembre», como en el diseño; mientras faltan datos, invita a elegirlos.
export function subtituloDe(ambiente, fecha) {
  if (!ambiente) {
    return 'Elija el ambiente, la fecha y las horas.'
  }
  if (!fecha) {
    return `${ambiente.nombre_ambiente} · elija la fecha.`
  }
  return `${ambiente.nombre_ambiente} · ${formatearFechaDelDia(fecha)}`
}
