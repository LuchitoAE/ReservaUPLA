import { ErrorDeApi } from '../api/clienteApi'

// Título del aviso según el tipo de error: el usuario sabe si debe corregir algo, elegir otro horario, reintentar
// o avisar a soporte. Son generales a propósito: cualquier página los usa con su propio mensaje.
const TITULOS = {
  datos_no_validos: 'Hay datos por corregir.',
  no_permitido: 'Acción no permitida.',
  no_encontrado: 'No se encontró lo que se buscaba.',
  conflicto: 'No se pudo completar la operación.',
  sin_conexion: 'Sin conexión con el servidor.',
  servidor: 'Error del servidor.',
}

// Convierte un error en el aviso que ve el usuario. El código de rastreo solo va en los errores del servidor,
// para que soporte encuentre el detalle en su registro; nunca se muestran detalles técnicos.
export function avisoDeError(error) {
  if (error instanceof ErrorDeApi) {
    return {
      titulo: TITULOS[error.tipo],
      mensaje: error.message,
      codigoRastreo: error.tipo === 'servidor' ? error.codigoRastreo : null,
    }
  }
  return { titulo: 'Ocurrió un error inesperado.', mensaje: 'Recargue la página e inténtelo de nuevo.', codigoRastreo: null }
}
