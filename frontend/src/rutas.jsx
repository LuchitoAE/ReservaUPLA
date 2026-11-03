import { createBrowserRouter } from 'react-router'
import { LayoutPrincipal } from './layouts/LayoutPrincipal'
import { Ambientes } from './paginas/Ambientes'
import { Inicio } from './paginas/Inicio'
import { NuevaReserva } from './paginas/NuevaReserva'
import { NuevoAmbiente } from './paginas/NuevoAmbiente'
import { NuevoUsuario } from './paginas/NuevoUsuario'
import { PaginaNoEncontrada } from './paginas/PaginaNoEncontrada'
import { Usuarios } from './paginas/Usuarios'

// Mapa de la SPA: cada dirección muestra su página dentro del layout principal (menú, encabezado y pie).
// Cambiar de página no recarga el documento: React Router reemplaza solo el contenido (<Outlet />).
export const rutas = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'reservas/nueva', element: <NuevaReserva /> },
      { path: 'ambientes', element: <Ambientes /> },
      { path: 'ambientes/nuevo', element: <NuevoAmbiente /> },
      { path: 'usuarios', element: <Usuarios /> },
      { path: 'usuarios/nuevo', element: <NuevoUsuario /> },
      { path: '*', element: <PaginaNoEncontrada /> },
    ],
  },
])
