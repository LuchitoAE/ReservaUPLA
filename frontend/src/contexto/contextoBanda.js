import { createContext, use } from 'react'

// Datos de la banda azul de la sección. La banda vive en el layout para quedarse quieta al cambiar de página; las
// páginas solo sobrescriben lo que saben mejor que la ruta (el saludo del panel, el código y el estado del detalle).
// La forma es { titulo, descripcion, insignia, accion } y se mezcla con lo que devuelve bandaDeRuta().
export const ContextoBanda = createContext(null)

export function useBandaDePagina() {
  return use(ContextoBanda)
}
