import { normalizarLinea } from '../utils/normalizarTexto'

// Validaciones genéricas, sin interfaz: cada módulo (usuario, ambiente, reserva) arma sus reglas con estas.
// Devuelven el mensaje de error o null. Son las mismas que aplica el dominio en el backend.

export function requerido(valor, mensaje) {
  return String(valor ?? '').trim() === '' ? mensaje : null
}

export function longitud(texto, { nombre, minimo, maximo }) {
  if (texto.length < minimo) {
    return `${nombre} debe tener al menos ${minimo} caracteres (tiene ${texto.length}).`
  }
  if (texto.length > maximo) {
    return `${nombre} no puede superar los ${maximo} caracteres (tiene ${texto.length}).`
  }
  return null
}

// Letras y al menos tres caracteres distintos: rechaza «aaaaaaaaaa» o «1234567890».
export function tieneContenidoUtil(texto) {
  const caracteres = new Set([...texto.toLowerCase()].filter((c) => /[\p{L}\p{N}]/u.test(c)))
  return /\p{L}/u.test(texto) && caracteres.size >= 3
}

// Texto obligatorio, con su longitud y con palabras de verdad.
export function texto(valor, { nombre, minimo, maximo, obligatorio }) {
  const normalizado = normalizarLinea(valor)
  return (
    requerido(normalizado, obligatorio) ??
    longitud(normalizado, { nombre, minimo, maximo }) ??
    (tieneContenidoUtil(normalizado) ? null : `${nombre} debe escribirse con palabras, no con caracteres repetidos.`)
  )
}

export function esCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)
}

// Quita los campos sin error: { nombre: null, correo: 'Escriba…' } → { correo: 'Escriba…' }.
export function soloErrores(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje))
}
