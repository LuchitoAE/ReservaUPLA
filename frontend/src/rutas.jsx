import { createBrowserRouter } from 'react-router'
import { SoloParaRoles } from './components/navegacion/SoloParaRoles'
import { LayoutPrincipal } from './layouts/LayoutPrincipal'
import { RaizDeLaApp } from './layouts/RaizDeLaApp'
import { Ambientes } from './paginas/Ambientes'
import { PanelPrincipal } from './paginas/PanelPrincipal'
import { DetalleReserva } from './paginas/DetalleReserva'
import { NuevaReserva } from './paginas/NuevaReserva'
import { NuevoAmbiente } from './paginas/NuevoAmbiente'
import { NuevoUsuario } from './paginas/NuevoUsuario'
import { PaginaDeError } from './paginas/PaginaDeError'
import { PaginaIngreso } from './paginas/PaginaIngreso'
import { PaginaNoEncontrada } from './paginas/PaginaNoEncontrada'
import { Reservas } from './paginas/Reservas'
import { Usuarios } from './paginas/Usuarios'

const ADMINISTRADOR = ['Administrador']

// Mapa de la SPA. La pantalla de ingreso va sola (no hay registro propio, RN-07); las del sistema, dentro del layout
// principal, que exige sesión. Cambiar de página no recarga el documento: React Router reemplaza solo el contenido.
// Si algo falla al dibujar una página, se muestra PaginaDeError en lugar del detalle técnico.
export const rutas = createBrowserRouter([
  {
    element: <RaizDeLaApp />,
    errorElement: <PaginaDeError />,
    children: [
      { path: '/ingreso', element: <PaginaIngreso /> },
      {
        path: '/',
        element: <LayoutPrincipal />,
        errorElement: <PaginaDeError />,
        children: [
          { index: true, element: <PanelPrincipal /> },
          { path: 'reservas', element: <Reservas /> },
          { path: 'reservas/nueva', element: <NuevaReserva /> },
          { path: 'reservas/:idReserva', element: <DetalleReserva /> },
          { path: 'ambientes', element: <Ambientes /> },
          { path: 'ambientes/nuevo', element: <SoloParaRoles roles={ADMINISTRADOR}><NuevoAmbiente /></SoloParaRoles> },
          { path: 'usuarios', element: <SoloParaRoles roles={ADMINISTRADOR}><Usuarios /></SoloParaRoles> },
          { path: 'usuarios/nuevo', element: <SoloParaRoles roles={ADMINISTRADOR}><NuevoUsuario /></SoloParaRoles> },
          { path: '*', element: <PaginaNoEncontrada /> },
        ],
      },
    ],
  },
])
