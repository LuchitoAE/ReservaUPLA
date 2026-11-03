// Único lugar que habla HTTP con la API. Toda respuesta trae success y message: si es exitosa se devuelve su
// cuerpo; si no, se lanza un ErrorDeApi que dice qué tipo de error fue y, si los hay, los errores por campo.
// Cada recurso (usuarios, ambientes, reservas…) tiene su propio archivo que usa pedir().
const RUTA_BASE = '/api'

export class ErrorDeApi extends Error {
  // tipo: 'sin_conexion' | 'datos_no_validos' | 'no_permitido' | 'no_encontrado' | 'conflicto' | 'servidor'
  constructor(tipo, mensaje, errores = {}, codigoRastreo = null) {
    super(mensaje)
    this.name = 'ErrorDeApi'
    this.tipo = tipo
    this.errores = errores
    this.codigoRastreo = codigoRastreo
  }
}

const TIPOS_POR_ESTADO = { 400: 'datos_no_validos', 403: 'no_permitido', 404: 'no_encontrado', 409: 'conflicto' }

function tipoDeError(estado) {
  return estado >= 500 ? 'servidor' : (TIPOS_POR_ESTADO[estado] ?? 'datos_no_validos')
}

// Arma la parte «?estado=Pendiente&fecha=…» con los filtros que tienen valor.
export function conFiltros(ruta, filtros = {}) {
  const parametros = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
  )
  const consulta = parametros.toString()
  return consulta ? `${ruta}?${consulta}` : ruta
}

export async function pedir(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${RUTA_BASE}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new ErrorDeApi('sin_conexion', 'No se pudo conectar con el servidor. Revise su conexión e inténtelo de nuevo.')
  }

  const tipo = respuesta.headers.get('content-type') ?? ''
  const cuerpo = tipo.includes('json') ? await respuesta.json().catch(() => null) : null

  if (respuesta.ok && cuerpo?.success) {
    return cuerpo
  }

  // Errores en formato RFC 9457: el primer mensaje de cada campo, para mostrarlo junto a él.
  const errores = Object.fromEntries(
    Object.entries(cuerpo?.errors ?? {}).map(([campo, mensajes]) => [campo, mensajes[0]]),
  )
  const tipoError = tipoDeError(respuesta.status)
  const mensaje =
    cuerpo?.message ??
    (tipoError === 'servidor'
      ? 'El servidor no respondió como se esperaba. Inténtelo de nuevo en unos minutos.'
      : `La API respondió con el estado ${respuesta.status}.`)

  throw new ErrorDeApi(tipoError, mensaje, errores, cuerpo?.traceId ?? null)
}
