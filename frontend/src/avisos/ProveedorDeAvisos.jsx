import { useState } from 'react'
import { ReproductorDeSonido } from '../sonido/ReproductorDeSonido'
import { crearCentralDeAvisos } from './centralDeAvisos'
import { contextoDeAvisos } from './contextoDeAvisos'
import { RegionDeAvisos } from './RegionDeAvisos'

// Una sola central de avisos para toda la aplicación (patrón Observer): las páginas la reciben por contexto y sus
// dos observadores, la región que pinta los avisos y el reproductor de sonido, quedan montados aquí. Como envuelve a
// todas las rutas, un aviso sigue visible al pasar de una página a otra (del formulario a la lista).
export function ProveedorDeAvisos({ children }) {
  const [central] = useState(crearCentralDeAvisos)

  return (
    <contextoDeAvisos.Provider value={central}>
      {children}
      <RegionDeAvisos central={central} />
      <ReproductorDeSonido central={central} />
    </contextoDeAvisos.Provider>
  )
}
