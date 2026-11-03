import { createContext } from 'react'

// Quién está usando el sistema. El caso no pide inicio de sesión: se elige al «usuario actual» entre los
// registrados y la API comprueba su rol antes de aprobar o rechazar (RN-05).
export const ContextoUsuarioActual = createContext(null)
