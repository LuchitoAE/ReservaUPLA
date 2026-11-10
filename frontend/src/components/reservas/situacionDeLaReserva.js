// En qué está una reserva, como lo dice la tarjeta de la decisión (diseño AD08 y AD09), con el color del semáforo
// (RNF-05): pendiente y cruce en ámbar, aprobada en verde, rechazada en rojo y cancelada en gris. «tipo» es el de
// AlertMessage. Si una pendiente choca con una aprobada, no se puede aprobar (RN-01, RN-08): la API también lo impide.
//   cruce: la reserva aprobada que ocupa ese horario (ver cruceAprobado), o null. Los textos son cortos: caben en
//   dos renglones del mensaje de alto fijo (RNF-04).
export function situacionDeLaReserva(reserva, { esAdministrador = false, cruce = null }) {
  switch (reserva.estado_reserva) {
    case 'Aprobada':
      return {
        tipo: 'exito',
        titulo: 'Aprobada',
        texto: 'El ambiente quedó ocupado en ese horario y nadie más puede reservarlo.',
        sePuedeAprobar: true,
      }
    case 'Rechazada':
      return { tipo: 'error', titulo: 'Rechazada', texto: 'Es un estado final: ya no se puede modificar.', sePuedeAprobar: true }
    case 'Cancelada':
      return { tipo: 'cancelada', titulo: 'Cancelada', texto: 'Es un estado final: el horario quedó libre.', sePuedeAprobar: true }
    default:
      if (cruce) {
        return {
          tipo: 'aviso',
          titulo: 'Choca con una reserva aprobada',
          texto: `${cruce.codigo_reserva} ya ocupa de ${cruce.hora_inicio_reserva} a ${cruce.hora_fin_reserva}: no se puede aprobar.`,
          sePuedeAprobar: false,
        }
      }
      return {
        tipo: 'aviso',
        titulo: 'Pendiente de aprobación',
        texto: esAdministrador
          ? 'Revise los datos y decida si la aprueba o la rechaza.'
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
