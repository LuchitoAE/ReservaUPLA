import { pedir } from './clienteApi'

// RF-08: indicadores del dashboard.
export function obtenerIndicadores() {
  return pedir('/dashboard/indicadores')
}
