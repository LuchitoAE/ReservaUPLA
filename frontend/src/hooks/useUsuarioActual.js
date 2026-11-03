import { use } from 'react'
import { ContextoUsuarioActual } from '../contexto/contextoUsuarioActual'

// { usuarios, cargando, usuarioActual, elegir(id), recargarUsuarios() }
export function useUsuarioActual() {
  return use(ContextoUsuarioActual)
}
