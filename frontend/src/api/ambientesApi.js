import { conFiltros, pedir } from './clienteApi'

// Endpoints de ambientes (RF-02).
export function listarAmbientes(filtros = {}) {
  return pedir(conFiltros('/ambientes', filtros))
}

export function registrarAmbiente(ambiente) {
  return pedir('/ambientes', { method: 'POST', body: JSON.stringify(ambiente) })
}
