// Secciones del sistema, en un solo lugar: el menú se arma con esta lista. Agregar una página es sumar su entrada
// aquí y su ruta en rutas.jsx. «roles»: quiénes la ven en el menú (si no se indica, todos).
// «activaEn»: direcciones en las que la sección se marca como actual (también sus subpáginas); «excepto», las que
// tienen su propia entrada en el menú.
export const SECCIONES = [
  { ruta: '/', nombre: 'Dashboard', icono: 'inicio', activaEn: ['/'] },
  { ruta: '/reservas', nombre: 'Reservas', icono: 'reservas', activaEn: ['/reservas/*'], excepto: ['/reservas/nueva'] },
  { ruta: '/reservas/nueva', nombre: 'Nueva reserva', icono: 'nueva', activaEn: ['/reservas/nueva'] },
  { ruta: '/ambientes', nombre: 'Ambientes', icono: 'ambientes', activaEn: ['/ambientes/*'] },
  { ruta: '/usuarios', nombre: 'Usuarios', icono: 'usuarios', activaEn: ['/usuarios/*'], roles: ['Administrador'] },
]
