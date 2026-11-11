// En qué está una reserva, como lo dice la tarjeta de la decisión (diseños AD06, AD08, AD09, S13 y S14), con el color
// del semáforo (RNF-05): pendiente libre en verde, cruce en ámbar, aprobada en verde, rechazada en rojo y cancelada
// en gris. «tipo» es el de AlertMessage. Si una pendiente choca con una aprobada, no se puede aprobar (RN-01, RN-08):
// la API también lo impide. Los textos son cortos: caben en el alto fijo de la tarjeta (RNF-04).
//   cruce: la reserva aprobada que ocupa ese horario (ver cruceAprobado), o null.

// '2026-11-11' → '11/11/2026', para nombrar el día del cruce como en el diseño AD09.
function fechaCorta(fecha) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

export function situacionDeLaReserva(reserva, { esAdministrador = false, cruce = null } = {}) {
  switch (reserva.estado_reserva) {
    case 'Aprobada':
      return {
        tipo: 'exito',
        titulo: 'Aprobada',
        texto: 'El ambiente quedó ocupado en ese horario y nadie más puede reservarlo.',
        sePuedeAprobar: true,
      }
    case 'Rechazada':
      return {
        tipo: 'error',
        titulo: 'Rechazada',
        texto: 'Una reserva rechazada no puede modificarse. Si aún necesita el ambiente, registre una nueva solicitud.',
        sePuedeAprobar: true,
      }
    case 'Cancelada':
      return {
        tipo: 'cancelada',
        titulo: 'Cancelada',
        texto: 'Su horario quedó libre y la reserva ya no puede reactivarse.',
        sePuedeAprobar: true,
      }
    default:
      if (cruce) {
        return {
          tipo: 'aviso',
          titulo: 'Choca con una reserva aprobada',
          texto: `${cruce.codigo_reserva} ocupa el ${reserva.nombre_ambiente} el ${fechaCorta(reserva.fecha_reserva)} de ${cruce.hora_inicio_reserva} a ${cruce.hora_fin_reserva}. No se puede aprobar; puede rechazarla.`,
          sePuedeAprobar: false,
        }
      }
      return {
        tipo: 'exito',
        titulo: 'El horario sigue libre',
        texto: esAdministrador
          ? `No se cruza con otra reserva aprobada del ${reserva.nombre_ambiente}.`
          : 'Un administrador debe aprobarla o rechazarla.',
        sePuedeAprobar: true,
      }
  }
}

// RN-01 y RN-08: la reserva aprobada del mismo ambiente y día cuyo horario se cruza con el de esta, o null. Dos
// horarios se cruzan si cada uno empieza antes de que termine el otro (08:00–10:00 y 10:00–12:00 no se cruzan).
// «reservasDelDia» viene de la consulta de disponibilidad; las horas «HH:mm» se comparan como texto.
export function cruceAprobado(reserva, reservasDelDia = []) {
  return (
    reservasDelDia.find(
      (otra) =>
        otra.estado_reserva === 'Aprobada' &&
        otra.codigo_reserva !== reserva.codigo_reserva &&
        otra.hora_inicio_reserva < reserva.hora_fin_reserva &&
        reserva.hora_inicio_reserva < otra.hora_fin_reserva,
    ) ?? null
  )
}
