import { pedir } from './clienteApi'

// Endpoints de Mi cuenta: siempre sobre el usuario de la sesión.
export function cambiarContrasena(cambio) {
  return pedir('/cuenta/contrasena', { method: 'PUT', body: JSON.stringify(cambio) })
}
