// RF-06: convierte el historial que envía la API en los pasos que muestra el detalle (diseño AD08). La primera
// entrada (Pendiente, por quien la solicitó) se ve como dos pasos: «Registrada», con quién la pidió, y «Pendiente de
// aprobación», que hizo el sistema. Cada cambio posterior es un paso con quién lo hizo. El último es el estado actual.
// Los cambios anteriores al historial no tienen autor: se marcan así, sin inventarlo.
export function pasosDelHistorial(historial = []) {
  const pasos = historial.flatMap((entrada, indice) => {
    const base = {
      fecha: entrada.fecha_historial,
      quien: entrada.nombre_completo_usuario ?? null,
      sinAutor: entrada.id_usuario == null,
      actual: false,
    }

    if (indice === 0 && entrada.estado_historial === 'Pendiente') {
      return [
        { ...base, clave: `${indice}-registrada`, estado: 'Registrada', titulo: 'Registrada' },
        { ...base, clave: `${indice}-pendiente`, estado: 'Pendiente', titulo: 'Pendiente de aprobación', quien: null, sinAutor: false },
      ]
    }

    return [{ ...base, clave: `${indice}-${entrada.estado_historial}`, estado: entrada.estado_historial, titulo: entrada.estado_historial }]
  })

  if (pasos.length > 0) {
    pasos[pasos.length - 1] = { ...pasos.at(-1), actual: true }
  }
  return pasos
}
