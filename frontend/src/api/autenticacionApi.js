import { pedir } from './clienteApi'

// Endpoints de la sesión. La cookie la maneja el navegador (HttpOnly): el JavaScript nunca ve la sesión.
// RF-09: se ingresa con el código y la contraseña. No hay registro propio (RN-07).
export function iniciarSesion({ codigo_usuario, contrasena_usuario }) {
  return pedir('/autenticacion/ingreso', { method: 'POST', body: JSON.stringify({ codigo_usuario, contrasena_usuario }) })
}

export function obtenerSesion() {
  return pedir('/autenticacion/sesion')
}

export function cerrarSesion() {
  return pedir('/autenticacion/salida', { method: 'POST' })
}
