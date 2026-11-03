// Textos que ve el usuario para los valores que viajan en la API (Solicitante, LaboratorioDeComputo…), y las
// opciones de las listas desplegables armadas con ellos. Un solo lugar: la tabla y el formulario dicen lo mismo.
export const ROLES = {
  Solicitante: 'Solicitante',
  Administrador: 'Administrador',
  ResponsableDeAmbiente: 'Responsable de ambiente',
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

export function opcionesDe(etiquetas) {
  return Object.entries(etiquetas).map(([valor, etiqueta]) => ({ valor, etiqueta }))
}
