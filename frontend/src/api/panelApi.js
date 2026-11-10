import { pedir } from './clienteApi'

// RF-08: indicadores del panel principal.
export function obtenerIndicadores() {
  return pedir('/panel/indicadores')
}
