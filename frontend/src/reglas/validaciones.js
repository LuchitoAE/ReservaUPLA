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
export function texto(valor, { nombre, minimo, maximo, obligatorio, normalizar = normalizarLinea }) {
  const normalizado = normalizar(valor)
  return (
    requerido(normalizado, obligatorio) ??
    longitud(normalizado, { nombre, minimo, maximo }) ??
    (tieneContenidoUtil(normalizado) ? null : `${nombre} debe escribirse con palabras, no con caracteres repetidos.`)
  )
}

export function esCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)
}

// Arma el validador de un formulario a partir de sus reglas: { campo: (valor, valores) => mensaje | null }.
// validarCampo revisa uno (al salir de él); validarTodo, todos (al enviar), en el orden en que se declararon.
// «tiene» dice si el formulario valida ese campo: los errores que solo detecta el servidor (por ejemplo, un dato que
// el formulario no pide) se conservan hasta el próximo envío en lugar de revisarse aquí.
export function crearValidador(reglas) {
  const tiene = (campo) => typeof reglas[campo] === 'function'
  const validarCampo = (campo, valores) => (tiene(campo) ? reglas[campo](valores[campo], valores) : null)
  const validarTodo = (valores) =>
    Object.fromEntries(
      Object.keys(reglas)
        .map((campo) => [campo, validarCampo(campo, valores)])
        .filter(([, mensaje]) => mensaje),
    )
  return { tiene, validarCampo, validarTodo }
}
