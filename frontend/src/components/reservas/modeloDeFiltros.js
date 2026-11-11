// Modelo de los filtros del listado de reservas (RF-05, diseños S09 y AD04): lo que se lee de la dirección, el alcance
// que corresponde al rol y los conteos de los chips. Funciones puras, aparte de la página y de la interfaz.
export const ESTADOS_EN_PLURAL = {
  Pendiente: 'Pendientes',
  Aprobada: 'Aprobadas',
  Rechazada: 'Rechazadas',
  Cancelada: 'Canceladas',
}

// Qué parte de las reservas ve primero cada rol. El administrador, todas.
export const ALCANCES = {
  Solicitante: { texto: 'Solo mis reservas', filtro: (usuario) => ({ id_usuario: usuario.id_usuario }) },
  ResponsableDeAmbiente: {
    texto: 'Solo los ambientes a mi cargo',
    filtro: (usuario) => ({ id_responsable_ambiente: usuario.id_usuario }),
  },
}

const CAMPOS_DE_FILTRO = ['estado_reserva', 'id_ambiente', 'fecha_desde', 'fecha_hasta', 'texto']

// Los filtros viven en la dirección (?estado_reserva=Pendiente): se pueden compartir y «atrás» vuelve al anterior.
export function leerFiltros(parametros) {
  return Object.fromEntries(CAMPOS_DE_FILTRO.map((campo) => [campo, parametros.get(campo) ?? '']))
}

// «todas=1» quita el alcance del rol; sin ese parámetro se respeta el que corresponde.
export function alcanceDelUsuario(usuario, parametros) {
  const alcance = usuario ? (ALCANCES[usuario.rol_usuario] ?? null) : null
  const soloLoMio = Boolean(alcance) && parametros.get('todas') !== '1'
  return { alcance, soloLoMio, filtroDeAlcance: soloLoMio ? alcance.filtro(usuario) : {} }
}

// Los chips muestran cuántas reservas hay en cada estado con el resto de los filtros puestos: se cuentan sin el
// estado, para que al elegir uno los demás conteos sigan diciendo la verdad (diseño S09).
export function contarPorEstado(reservas = []) {
  const porEstado = Object.fromEntries(Object.keys(ESTADOS_EN_PLURAL).map((estado) => [estado, 0]))
  reservas.forEach((reserva) => {
    if (reserva.estado_reserva in porEstado) {
      porEstado[reserva.estado_reserva] += 1
    }
  })
  return { total: reservas.length, ...porEstado }
}

// De la fecha más próxima a la más lejana (diseño AD04: «Fecha ↑»), sin depender del orden de la base.
export function ordenarPorFecha(reservas = []) {
  return [...reservas].sort((una, otra) =>
    `${una.fecha_reserva} ${una.hora_inicio_reserva}`.localeCompare(`${otra.fecha_reserva} ${otra.hora_inicio_reserva}`),
  )
}
