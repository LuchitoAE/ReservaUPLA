import { createContext, use } from 'react'

// Última miga de la barra superior cuando la página sabe un nombre mejor que la dirección. El detalle de una reserva
// lo usa para mostrar su código (diseños AD06, AD08 y AD09: «Panel principal › Reservas › RES-2026-0002»); mientras
// carga no hay código y queda «Reserva», como en C08. La página lo fija al tener los datos y lo borra al salir.
export const ContextoMiga = createContext(null)

export function useMigaDePagina() {
  return use(ContextoMiga)
}
