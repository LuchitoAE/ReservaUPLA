import { conFiltros, pedir } from './clienteApi'

// Endpoints de usuarios (RF-01).
export function listarUsuarios(filtros = {}) {
  return pedir(conFiltros('/usuarios', filtros))
}

export function registrarUsuario(usuario) {
  return pedir('/usuarios', { method: 'POST', body: JSON.stringify(usuario) })
}
