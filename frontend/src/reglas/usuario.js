import { normalizarCorreo, normalizarLinea } from '../utils/normalizarTexto'
import { crearValidador, esCorreo, requerido, texto } from './validaciones'

// Reglas de los formularios de usuario (RF-01) y de ingreso, iguales a las de Domain/Entities/Usuario.cs.
export const USUARIO = { nombreMaximo: 150, correoMaximo: 150, contrasenaMaxima: 64 }

// Las mismas que Usuario.RevisarContrasena: de 8 a 64 caracteres, con mayúscula, minúscula y número.
export const REGLAS_DE_CONTRASENA = [
  { texto: '8 caracteres o más', cumple: (valor) => valor.length >= 8 },
  { texto: 'Una mayúscula', cumple: (valor) => /\p{Lu}/u.test(valor) },
  { texto: 'Una minúscula', cumple: (valor) => /\p{Ll}/u.test(valor) },
  { texto: 'Un número', cumple: (valor) => /\d/.test(valor) },
]

const nombre = (valor) =>
  texto(valor, {
    nombre: 'El nombre completo',
    minimo: 5,
    maximo: USUARIO.nombreMaximo,
    obligatorio: 'Escriba el nombre y los apellidos.',
  }) ?? (normalizarLinea(valor).includes(' ') ? null : 'Escriba el nombre y al menos un apellido.')

const correo = (valor) => {
  const normalizado = normalizarCorreo(valor)
  return (
    requerido(normalizado, 'Escriba el correo.') ??
    (esCorreo(normalizado) ? null : 'Escriba un correo válido, por ejemplo nombre.apellido@upla.edu.pe.')
  )
}

const contrasena = (valor) =>
  requerido(valor, 'Escriba una contraseña.') ??
  (valor.length > USUARIO.contrasenaMaxima
    ? `La contraseña no puede superar los ${USUARIO.contrasenaMaxima} caracteres.`
    : REGLAS_DE_CONTRASENA.every((regla) => regla.cumple(valor))
      ? null
      : 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.')

const confirmacion = (valor, valores) =>
  requerido(valor, 'Vuelva a escribir la contraseña.') ??
  (valor === valores.contrasena_usuario ? null : 'Las dos contraseñas no coinciden.')

// Registro por el administrador: cualquier rol, con una contraseña inicial.
export const reglasDeUsuario = crearValidador({
  nombre_completo_usuario: nombre,
  correo_usuario: correo,
  rol_usuario: (valor) => requerido(valor, 'Elija el rol del usuario.'),
  contrasena_usuario: contrasena,
})

// Cuenta que crea el propio solicitante: confirma la contraseña para no equivocarse al escribirla.
export const reglasDeCuenta = crearValidador({
  nombre_completo_usuario: nombre,
  correo_usuario: correo,
  contrasena_usuario: contrasena,
  confirmacion_contrasena: confirmacion,
})

// Ingreso: solo que estén escritos; si no coinciden, la API responde sin decir cuál falló.
export const reglasDeIngreso = crearValidador({
  correo_usuario: correo,
  contrasena_usuario: (valor) => requerido(valor, 'Escriba su contraseña.'),
})

// Lo que se envía: los textos ya normalizados. La contraseña va tal cual (los espacios cuentan).
export function normalizarUsuario(valores) {
  return {
    nombre_completo_usuario: normalizarLinea(valores.nombre_completo_usuario),
    correo_usuario: normalizarCorreo(valores.correo_usuario),
    rol_usuario: valores.rol_usuario,
    contrasena_usuario: valores.contrasena_usuario,
  }
}
