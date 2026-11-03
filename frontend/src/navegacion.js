// Secciones del sistema, en un solo lugar: el menú se arma con esta lista. Agregar una página es sumar su entrada
// aquí y su ruta en rutas.jsx. Las que todavía no existen van sin «ruta»: se ven como «Próximamente».
export const SECCIONES = [
  { ruta: '/', nombre: 'Inicio', icono: 'inicio' },
  { nombre: 'Reservas', icono: 'reservas' },
  { ruta: '/reservas/nueva', nombre: 'Nueva reserva', icono: 'nueva' },
  { ruta: '/ambientes', nombre: 'Ambientes', icono: 'ambientes' },
  { ruta: '/usuarios', nombre: 'Usuarios', icono: 'usuarios' },
]
