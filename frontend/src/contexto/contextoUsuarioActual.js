import { createContext } from 'react'

// El usuario que inició sesión (o null) y las acciones para entrar y salir. Lo provee ProveedorDeSesion.
export const ContextoUsuarioActual = createContext(null)
