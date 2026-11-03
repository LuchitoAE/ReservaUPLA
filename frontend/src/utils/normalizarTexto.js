// Las mismas reglas de normalización que el dominio (Domain/Common/Texto.cs): se valida lo que de verdad se guarda.

// Un renglón: sin espacios al inicio ni al final y uno solo entre palabras.
export function normalizarLinea(texto = '') {
  return texto.trim().replace(/\s+/g, ' ')
}

// Varios renglones: cada renglón normalizado, sin más de una línea en blanco seguida.
export function normalizarParrafos(texto = '') {
  return texto
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(normalizarLinea)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizarCorreo(correo = '') {
  return correo.trim().toLowerCase()
}
