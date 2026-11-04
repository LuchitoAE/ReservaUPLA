import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import '@fontsource-variable/montserrat'
import './index.css'
import { rutas } from './rutas'

// Punto de entrada: la SPA arranca con el enrutador, que decide qué página mostrar según la dirección.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)
