import { ErrorDeApi } from '../api/clienteApi'

// Título del aviso según el tipo de error: el usuario sabe si debe corregir algo, elegir otro horario, reintentar
// o pedir ayuda. Son generales a propósito: cualquier página los usa con su propio mensaje. No se muestran códigos
// internos ni detalles técnicos (Shneiderman: manejo simple de errores).
const TITULOS = {
  datos_no_validos: 'Hay datos por corregir.',
  no_autenticado: 'No se pudo iniciar sesión.',
  no_permitido: 'Acción no permitida.',
  no_encontrado: 'No se encontró lo que se buscaba.',
  conflicto: 'No se pudo completar la operación.',
  sin_conexion: 'Sin conexión con el servidor.',
  servidor: 'Error del servidor.',
}

export function avisoDeError(error) {
  if (error instanceof ErrorDeApi) {
    return { titulo: TITULOS[error.tipo], mensaje: error.message }
  }
  return { titulo: 'Ocurrió un error inesperado.', mensaje: 'Recargue la página e inténtelo de nuevo.' }
}
