import { ahoraEnPeru } from '../utils/fechas'
import { normalizarParrafos } from '../utils/normalizarTexto'
import { crearValidador, requerido, texto } from './validaciones'

// Reglas del formulario de reserva, iguales a las de Domain/Entidades/Reserva.cs:
// RN-02 todos los datos, RN-03 fin mayor que inicio, RN-04 entre 07:00 y 22:00, y que no empiece en el pasado.
// Los mensajes dicen qué corregir con palabras del usuario, sin códigos de reglas (Shneiderman), y caben en la línea
// que cada campo reserva bajo él (RNF-04). La API dice lo mismo con más detalle, para quien la usa directamente.
// Las horas «HH:mm» se comparan como texto: '09:30' < '10:00'.
export const RESERVA = { apertura: '07:00', cierre: '22:00', motivoMinimo: 10, motivoMaximo: 500 }

export const reglasDeReserva = crearValidador({
  id_ambiente: (valor) => requerido(valor, 'Elija el ambiente que necesita.'),
  fecha_reserva: (valor) => {
    const hoy = ahoraEnPeru().fecha
    return (
      requerido(valor, 'Elija la fecha de la reserva.') ?? (valor < hoy ? 'No puede ser anterior a hoy.' : null)
    )
  },
  hora_inicio_reserva: (valor, valores) => {
    const ahora = ahoraEnPeru()
    return (
      requerido(valor, 'Indique la hora de inicio.') ??
      (valor < RESERVA.apertura || valor >= RESERVA.cierre
        ? 'Entre 07:00 y 22:00.'
        : null) ??
      (valores.fecha_reserva === ahora.fecha && valor <= ahora.hora
        ? `Ya pasó: elija después de las ${ahora.hora}.`
        : null)
    )
  },
  hora_fin_reserva: (valor, valores) =>
    requerido(valor, 'Indique la hora de fin.') ??
    (valor > RESERVA.cierre ? 'Hasta las 22:00.' : null) ??
    (valores.hora_inicio_reserva && valor <= valores.hora_inicio_reserva
      ? 'Mayor que la hora de inicio.'
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
