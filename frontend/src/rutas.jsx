import { createBrowserRouter } from 'react-router'
import { LayoutPrincipal } from './layouts/LayoutPrincipal'
import { Inicio } from './paginas/Inicio'
import { PaginaNoEncontrada } from './paginas/PaginaNoEncontrada'

// Mapa de la SPA: cada dirección muestra su página dentro del layout principal (menú, encabezado y pie).
// Cambiar de página no recarga el documento: React Router reemplaza solo el contenido (<Outlet />).
export const rutas = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      { index: true, element: <Inicio /> },
      { path: '*', element: <PaginaNoEncontrada /> },
    ],
  },
])
