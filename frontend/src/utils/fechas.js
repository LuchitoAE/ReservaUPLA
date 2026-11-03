// Fechas y horas como las ve el usuario en Perú. La API envía fechas «AAAA-MM-DD», horas «HH:mm» y momentos en UTC.
const ZONA = 'America/Lima'

// Fecha y hora actuales en Perú, en el mismo formato de los campos: { fecha: '2026-11-03', hora: '17:45' }.
export function ahoraEnPeru() {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((parte) => [parte.type, parte.value]),
  )
  return { fecha: `${partes.year}-${partes.month}-${partes.day}`, hora: `${partes.hour}:${partes.minute}` }
}

// '2026-11-10' → '10/11/2026'
export function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

// '2026-11-10' → 'martes, 10 de noviembre de 2026'
export function formatearFechaLarga(fecha) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Momento en UTC → '03/11/2026, 17:45' en hora de Perú.
export function formatearMomento(momento) {
  return new Date(momento).toLocaleString('es-PE', { timeZone: ZONA, dateStyle: 'short', timeStyle: 'short' })
}

export function formatearHorario(inicio, fin) {
  return `${inicio} a ${fin}`
}
