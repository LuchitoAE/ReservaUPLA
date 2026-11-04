import { pedir } from './clienteApi'

// Endpoints de la sesión. La cookie la maneja el navegador (HttpOnly): el JavaScript nunca ve la sesión.
export function iniciarSesion({ correo_usuario, contrasena_usuario }) {
  return pedir('/autenticacion/ingreso', { method: 'POST', body: JSON.stringify({ correo_usuario, contrasena_usuario }) })
}

// RF-01: la persona crea su propia cuenta de solicitante.
export function crearCuenta({ nombre_completo_usuario, correo_usuario, contrasena_usuario }) {
  return pedir('/autenticacion/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre_completo_usuario, correo_usuario, contrasena_usuario }),
  })
}

export function obtenerSesion() {
  return pedir('/autenticacion/sesion')
}

export function cerrarSesion() {
  return pedir('/autenticacion/salida', { method: 'POST' })
}
