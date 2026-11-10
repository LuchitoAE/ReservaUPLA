import { createContext } from 'react'

// La central de avisos de la aplicación (ver ProveedorDeAvisos). Las páginas la usan con el hook useAviso.
export const contextoDeAvisos = createContext(null)
