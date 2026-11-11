// Secciones del sistema, en un solo lugar: el menú se arma con esta lista. Agregar una página es sumar su entrada
// aquí y su ruta en rutas.jsx. «roles»: quiénes la ven en el menú (si no se indica, todos).
// «activaEn»: direcciones en las que la sección se marca como actual (también sus subpáginas); «excepto», las que
// tienen su propia entrada en el menú. «enMenu: false»: la página existe y tiene migas, pero no ocupa un renglón del
// menú porque se llega a ella por su botón (Nueva reserva). «grupo»: el bloque del menú donde se agrupa, que solo se
// dibuja para quien administra (diseño AD01): para los demás roles es una sección más de la lista.
export const SECCIONES = [
  { ruta: '/', nombre: 'Panel principal', icono: 'inicio', activaEn: ['/'] },
  { ruta: '/reservas', nombre: 'Reservas', icono: 'reservas', activaEn: ['/reservas/*'], excepto: ['/reservas/nueva'] },
  { ruta: '/reservas/nueva', nombre: 'Nueva reserva', icono: 'nueva', activaEn: ['/reservas/nueva'], enMenu: false },
  { ruta: '/ambientes', nombre: 'Ambientes', icono: 'ambientes', activaEn: ['/ambientes/*'], grupo: 'Administración' },
  {
    ruta: '/usuarios',
    nombre: 'Usuarios',
    icono: 'usuarios',
    activaEn: ['/usuarios/*'],
    roles: ['Administrador'],
    grupo: 'Administración',
  },
]
