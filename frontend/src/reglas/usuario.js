import { normalizarCodigo, normalizarCorreo, normalizarLinea } from '../utils/normalizarTexto'
import { crearValidador, esCorreo, requerido, texto } from './validaciones'

// Reglas de los formularios de usuario (RF-01) y de ingreso (RF-09), iguales a las del dominio (Usuario.cs y
// CodigoDeUsuario.cs).
export const USUARIO = { codigoLongitud: 7, nombreMaximo: 150, correoMaximo: 150, contrasenaMaxima: 64 }

// Las mismas que Usuario.RevisarContrasena: de 8 a 64 caracteres, con mayúscula, minúscula y número.
export const REGLAS_DE_CONTRASENA = [
  { texto: '8 caracteres o más', cumple: (valor) => valor.length >= 8 },
  { texto: 'Una mayúscula', cumple: (valor) => /\p{Lu}/u.test(valor) },
  { texto: 'Una minúscula', cumple: (valor) => /\p{Ll}/u.test(valor) },
  { texto: 'Un número', cumple: (valor) => /\d/.test(valor) },
]

// RN-14: 7 letras (A-Z) o dígitos, por ejemplo P00914K o ADMIN01.
const codigo = (valor) => {
  const normalizado = normalizarCodigo(valor)
  return (
    requerido(normalizado, 'Escriba el código del usuario.') ??
    (/^[A-Z0-9]{7}$/.test(normalizado) ? null : 'El código debe tener 7 letras o números, por ejemplo P00914K.')
  )
}

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
      : 'Mínimo 8 caracteres, con mayúscula, minúscula y número.')

// Registro por el administrador: cualquier rol, con una contraseña inicial.
export const reglasDeUsuario = crearValidador({
  codigo_usuario: codigo,
  nombre_completo_usuario: nombre,
  correo_usuario: correo,
  rol_usuario: (valor) => requerido(valor, 'Elija el rol del usuario.'),
  contrasena_usuario: contrasena,
})

// Ingreso (RF-09, diseño AC02): el formato del código se revisa antes de enviarlo, para no gastar un viaje a la API
// por un código incompleto; si el formato está bien y no coincide, la API responde sin decir cuál de los dos falló.
export const reglasDeIngreso = crearValidador({
  codigo_usuario: (valor) => {
    const normalizado = normalizarCodigo(valor)
    return (
      requerido(normalizado, 'Escriba su código.') ??
      (/^[A-Z0-9]{7}$/.test(normalizado) ? null : 'Escriba un código válido, por ejemplo P00914K.')
    )
  },
  contrasena_usuario: (valor) => requerido(valor, 'Escriba su contraseña.'),
})

// Mi cuenta (RF-11): la actual, la nueva (RN-13 y distinta de la actual, como Usuario.CambiarContrasena) y su
// repetición, que solo revisa la interfaz para que un error de tipeo no deje al usuario sin poder entrar.
export const reglasDeCambioDeContrasena = crearValidador({
  contrasena_actual: (valor) => requerido(valor, 'Escriba su contraseña actual.'),
  contrasena_nueva: (valor, valores) =>
    contrasena(valor) ?? (valor === valores.contrasena_actual ? 'Debe ser distinta de la actual.' : null),
  repetir_contrasena: (valor, valores) =>
    requerido(valor, 'Repita la nueva contraseña.') ??
    (valor !== valores.contrasena_nueva ? 'Las dos contraseñas no coinciden.' : null),
})

// Lo que se envía al cambiar la contraseña: la actual y la nueva, tal cual.
export function normalizarCambioDeContrasena(valores) {
  return { contrasena_actual: valores.contrasena_actual, contrasena_nueva: valores.contrasena_nueva }
}

// Lo que se envía: los textos ya normalizados. La contraseña va tal cual (los espacios cuentan).
export function normalizarUsuario(valores) {
  return {
    codigo_usuario: normalizarCodigo(valores.codigo_usuario),
    nombre_completo_usuario: normalizarLinea(valores.nombre_completo_usuario),
    correo_usuario: normalizarCorreo(valores.correo_usuario),
    rol_usuario: valores.rol_usuario,
    contrasena_usuario: valores.contrasena_usuario,
  }
}
