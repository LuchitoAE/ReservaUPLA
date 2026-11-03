import { ahoraEnPeru, formatearFecha } from '../utils/fechas'
import { normalizarParrafos } from '../utils/normalizarTexto'
import { crearValidador, requerido, texto } from './validaciones'

// Reglas del formulario de reserva, iguales a las de Domain/Entities/Reserva.cs:
// RN-02 todos los datos, RN-03 fin mayor que inicio, RN-04 entre 07:00 y 22:00, y que no empiece en el pasado.
// Los mensajes dicen qué corregir con palabras del usuario, sin códigos de reglas (Shneiderman).
// Las horas «HH:mm» se comparan como texto: '09:30' < '10:00'.
export const RESERVA = { apertura: '07:00', cierre: '22:00', motivoMinimo: 10, motivoMaximo: 500 }

export const reglasDeReserva = crearValidador({
  id_usuario: (valor) => requerido(valor, 'Elija el usuario actual en la barra lateral: será el solicitante.'),
  id_ambiente: (valor) => requerido(valor, 'Elija el ambiente que necesita.'),
  fecha_reserva: (valor) => {
    const hoy = ahoraEnPeru().fecha
    return (
      requerido(valor, 'Elija la fecha de la reserva.') ??
      (valor < hoy ? `La fecha no puede ser anterior a hoy (${formatearFecha(hoy)}).` : null)
    )
  },
  hora_inicio_reserva: (valor, valores) => {
    const ahora = ahoraEnPeru()
    return (
      requerido(valor, 'Indique la hora de inicio.') ??
      (valor < RESERVA.apertura || valor >= RESERVA.cierre
        ? 'La hora de inicio debe estar entre las 07:00 y las 22:00.'
        : null) ??
      (valores.fecha_reserva === ahora.fecha && valor <= ahora.hora
        ? `Esa hora ya pasó: hoy elija una hora posterior a las ${ahora.hora}.`
        : null)
    )
  },
  hora_fin_reserva: (valor, valores) =>
    requerido(valor, 'Indique la hora de fin.') ??
    (valor > RESERVA.cierre ? 'La hora de fin no puede pasar de las 22:00.' : null) ??
    (valores.hora_inicio_reserva && valor <= valores.hora_inicio_reserva
      ? 'La hora de fin debe ser mayor que la hora de inicio.'
      : null),
  motivo_reserva: (valor) =>
    texto(valor, {
      nombre: 'El motivo',
      minimo: RESERVA.motivoMinimo,
      maximo: RESERVA.motivoMaximo,
      obligatorio: 'Explique para qué necesita el ambiente.',
      normalizar: normalizarParrafos,
    }),
})

// Los cuatro datos que decide la disponibilidad están completos y son válidos: ya se puede preguntar a la API.
export function horarioCompleto(valores) {
  return ['id_ambiente', 'fecha_reserva', 'hora_inicio_reserva', 'hora_fin_reserva'].every(
    (campo) => !reglasDeReserva.validarCampo(campo, valores),
  )
}

export function normalizarReserva(valores) {
  return { ...valores, motivo_reserva: normalizarParrafos(valores.motivo_reserva) }
}
