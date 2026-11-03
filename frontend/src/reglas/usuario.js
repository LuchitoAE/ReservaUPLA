import { normalizarCorreo, normalizarLinea } from '../utils/normalizarTexto'
import { esCorreo, requerido, soloErrores, texto } from './validaciones'

// Reglas del formulario de usuario (RF-01), iguales a las de Domain/Entities/Usuario.cs.
export const USUARIO = { nombreMaximo: 150, correoMaximo: 150 }

const REGLAS = {
  nombre_completo_usuario: (valor) => {
    const error = texto(valor, {
      nombre: 'El nombre completo',
      minimo: 5,
      maximo: USUARIO.nombreMaximo,
      obligatorio: 'Escriba el nombre y los apellidos del usuario.',
    })
    return error ?? (normalizarLinea(valor).includes(' ') ? null : 'Escriba el nombre y al menos un apellido.')
  },
  correo_usuario: (valor) => {
    const correo = normalizarCorreo(valor)
    return (
      requerido(correo, 'Escriba el correo del usuario.') ??
      (esCorreo(correo) ? null : 'Escriba un correo válido, por ejemplo nombre.apellido@upla.edu.pe.')
    )
  },
  rol_usuario: (valor) => requerido(valor, 'Elija el rol del usuario.'),
}

export function validarCampoDeUsuario(campo, valores) {
  return REGLAS[campo](valores[campo])
}

export function validarUsuario(valores) {
  return soloErrores(Object.fromEntries(Object.keys(REGLAS).map((campo) => [campo, validarCampoDeUsuario(campo, valores)])))
}

// Lo que se envía: los textos ya normalizados.
export function normalizarUsuario(valores) {
  return {
    nombre_completo_usuario: normalizarLinea(valores.nombre_completo_usuario),
    correo_usuario: normalizarCorreo(valores.correo_usuario),
    rol_usuario: valores.rol_usuario,
  }
}
