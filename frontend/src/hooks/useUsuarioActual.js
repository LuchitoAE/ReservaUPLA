import { use } from 'react'
import { ContextoUsuarioActual } from '../contexto/contextoUsuarioActual'

// { usuarioActual, cargando, motivoSinSesion ('terminada' | 'salida' | null), iniciarSesion(credenciales),
//   cerrarSesion() }
export function useUsuarioActual() {
  return use(ContextoUsuarioActual)
}
