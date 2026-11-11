// Reglas de la agenda de la semana del responsable (RF-13, diseño R01). Funciones puras sobre fechas «AAAA-MM-DD» (en
// UTC, para que el huso del equipo no cambie el día) y horas «HH:mm». La semana va de lunes a domingo: el sistema acepta
// reservas cualquier día. Solo las aprobadas y las pendientes ocupan el ambiente; las rechazadas y las canceladas no.
export const APERTURA = '07:00'
export const CIERRE = '22:00'
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIA_MS = 24 * 60 * 60 * 1000

const aFecha = (texto) => new Date(`${texto}T00:00:00Z`)
const aTexto = (fecha) => fecha.toISOString().slice(0, 10)
const sumarDias = (texto, dias) => aTexto(new Date(aFecha(texto).getTime() + dias * DIA_MS))
const minutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Las horas que marcan la cuadrícula, de la apertura al cierre («07:00» … «21:00»).
export const HORAS_DE_LA_AGENDA = Array.from(
  { length: (minutos(CIERRE) - minutos(APERTURA)) / 60 },
  (_, indice) => `${String(Number(APERTURA.slice(0, 2)) + indice).padStart(2, '0')}:00`,
)

// «lunes 9», «lun 9»: el nombre del día en la cuadrícula y en la lista del teléfono.
export function nombreDelDia(fecha, formato) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', formato).replace('.', '')
}

export function lunesDe(fecha) {
  const desdeElLunes = (aFecha(fecha).getUTCDay() + 6) % 7
  return sumarDias(fecha, -desdeElLunes)
}

export function diasDeLaSemana(lunes) {
  return Array.from({ length: 7 }, (_, dia) => sumarDias(lunes, dia))
}

export function moverSemana(lunes, semanas) {
  return sumarDias(lunes, semanas * 7)
}

// «Semana del 9 al 15 de noviembre»; el mes del lunes solo si cambia, y el año solo si cambia.
export function tituloDeLaSemana(lunes) {
  const domingo = aFecha(sumarDias(lunes, 6))
  const inicio = aFecha(lunes)
  const otroAnio = inicio.getUTCFullYear() !== domingo.getUTCFullYear()
  const otroMes = otroAnio || inicio.getUTCMonth() !== domingo.getUTCMonth()
  const fin = `${domingo.getUTCDate()} de ${MESES[domingo.getUTCMonth()]}${otroAnio ? ` de ${domingo.getUTCFullYear()}` : ''}`
  const desde = `${inicio.getUTCDate()}${otroMes ? ` de ${MESES[inicio.getUTCMonth()]}` : ''}${otroAnio ? ` de ${inicio.getUTCFullYear()}` : ''}`
  return `Semana del ${desde} al ${fin}`
}

// Cada reserva aprobada o pendiente de la semana, en su día (0 = lunes) y como porcentaje del alto de la agenda.
export function bloquesDeLaAgenda(reservas, lunes) {
  const dias = diasDeLaSemana(lunes)
  const duracion = minutos(CIERRE) - minutos(APERTURA)
  return reservas
    .filter((reserva) => ['Aprobada', 'Pendiente'].includes(reserva.estado_reserva) && dias.includes(reserva.fecha_reserva))
    .map((reserva) => ({
      reserva,
      dia: dias.indexOf(reserva.fecha_reserva),
      arriba: ((minutos(reserva.hora_inicio_reserva) - minutos(APERTURA)) / duracion) * 100,
      alto: ((minutos(reserva.hora_fin_reserva) - minutos(reserva.hora_inicio_reserva)) / duracion) * 100,
    }))
}
