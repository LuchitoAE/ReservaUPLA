// Textos que ve el usuario para los valores que viajan en la API (Solicitante, LaboratorioDeComputo…), y las
// opciones de las listas desplegables armadas con ellos. Un solo lugar: la tabla y el formulario dicen lo mismo.
export const ROLES = {
  Solicitante: 'Solicitante',
  Administrador: 'Administrador',
  ResponsableDeAmbiente: 'Responsable de ambiente',
}

// Qué puede hacer cada rol: se muestra al elegirlo y junto al usuario actual (el usuario sabe qué puede hacer con
// solo mirar la pantalla, Norman).
export const QUE_HACE_EL_ROL = {
  Solicitante: 'Pide reservas y cancela las suyas.',
  Administrador: 'Aprueba, rechaza o cancela reservas.',
  ResponsableDeAmbiente: 'Consulta el uso de los ambientes a su cargo.',
}

export const TIPOS_AMBIENTE = {
  LaboratorioDeComputo: 'Laboratorio de cómputo',
  Auditorio: 'Auditorio',
  SalaDeReuniones: 'Sala de reuniones',
  LaboratorioEspecializado: 'Laboratorio especializado',
}

export const ESTADOS_AMBIENTE = {
  Disponible: 'Disponible',
  EnMantenimiento: 'En mantenimiento',
  Inactivo: 'Inactivo',
}

export const ESTADOS_RESERVA = {
  Pendiente: 'Pendiente',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
  Cancelada: 'Cancelada',
}

export function opcionesDe(etiquetas) {
  return Object.entries(etiquetas).map(([valor, etiqueta]) => ({ valor, etiqueta }))
}

// Iniciales para el avatar (chip de la sesión y Mi cuenta): «Luis Aquino Espinoza» → «LA».
export function inicialesDe(nombreCompleto) {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}
