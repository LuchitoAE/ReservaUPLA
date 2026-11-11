// Cómo se presenta cada acción de la reserva: el botón de la tarjeta, el de la confirmación, lo que pasa después y el
// verbo para el error. En la tarjeta, aprobar va relleno en verde, rechazar y cancelar con borde rojo, y cancelar una
// pendiente del administrador como enlace azul (diseños AD06, AD08, AD09, S11 y S14).
export const ACCIONES = {
  Aprobada: {
    boton: 'Aprobar reserva',
    verbo: 'aprobar',
    variante: 'aprobar',
    confirmacion: 'aprobar',
    icono: 'aprobada',
    pregunta: '¿Aprobar la reserva?',
    efecto: 'El ambiente quedará ocupado en ese horario y nadie más podrá reservarlo.',
  },
  Rechazada: {
    boton: 'Rechazar reserva',
    verbo: 'rechazar',
    variante: 'peligro-borde',
    confirmacion: 'peligro',
    icono: 'rechazada',
    pregunta: '¿Rechazar la reserva?',
    efecto: 'Una reserva rechazada ya no puede modificarse.',
  },
  Cancelada: {
    boton: 'Cancelar reserva',
    verbo: 'cancelar',
    variante: 'peligro-borde',
    confirmacion: 'peligro',
    icono: 'cancelada',
    pregunta: '¿Cancelar la reserva?',
    efecto: 'El horario quedará libre y la reserva ya no podrá reactivarse.',
  },
}

const ESTADOS_FINALES = ['Rechazada', 'Cancelada']

// RF-07 y RN-05: a qué estados puede pasar la reserva según su estado actual (lo envía la API) y el rol de quien mira.
// Cancelar lo puede hacer el administrador o quien solicitó; aprobar y rechazar, solo el administrador.
export function accionesPermitidas(reserva, { esAdministrador, esSolicitante }) {
  return reserva.estados_siguientes_reserva.filter((estado) =>
    estado === 'Cancelada' ? esAdministrador || esSolicitante : esAdministrador,
  )
}

// Todo lo que la tarjeta necesita saber de la reserva y del usuario, sin efectos: título, ícono, acciones y avisos.
// El título y el ícono dicen desde qué lugar se mira la reserva (AD06, S11, S13, S14 y R04).
export function presentacionDeLaDecision(reserva, usuarioActual) {
  const esAdministrador = usuarioActual?.rol_usuario === 'Administrador'
  const esResponsable = usuarioActual?.rol_usuario === 'ResponsableDeAmbiente'
  const esSolicitante = usuarioActual?.id_usuario === reserva.id_usuario
  const esFinal = ESTADOS_FINALES.includes(reserva.estado_reserva)
  const permitidas = accionesPermitidas(reserva, { esAdministrador, esSolicitante })
  const soloCancelar = permitidas.length === 1 && permitidas[0] === 'Cancelada'

  return {
    esAdministrador,
    esResponsable,
    esSolicitante,
    esFinal,
    permitidas,
    soloCancelar,
    // El administrador ve siempre la situación; el solicitante, cuando ya no está pendiente (S11 no la lleva).
    verSituacion: esAdministrador || (esSolicitante && reserva.estado_reserva !== 'Pendiente'),
    titulo: esAdministrador ? 'Decisión' : esResponsable ? 'Uso de su ambiente' : esFinal ? 'Estado final' : 'Acciones',
    icono: esResponsable ? 'ambientes' : esFinal ? 'cancelada' : 'aprobada',
  }
}

// Cuando el administrador puede aprobar o rechazar, cancelar queda al pie como enlace (AD06). Si es la única acción,
// va como botón de borde rojo (AD08).
export function esAccionComoEnlace(estado, { esAdministrador, esFinal, permitidas }) {
  return estado === 'Cancelada' && esAdministrador && !esFinal && permitidas.length > 1
}
