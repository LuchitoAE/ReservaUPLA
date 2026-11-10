// Preferencias que el navegador recuerda (modo claro u oscuro, foto del ingreso, animación en pausa). Guardarlas es una
// comodidad: si el navegador no lo permite (ventana privada, datos bloqueados), la aplicación funciona igual y la
// preferencia dura hasta recargar la página.
export function leerPreferencia(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function guardarPreferencia(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // Sin almacenamiento: la preferencia dura hasta recargar.
  }
}
