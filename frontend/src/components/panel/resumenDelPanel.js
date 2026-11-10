// La frase con la que el panel principal saluda a cada rol (RF-12; diseños S01, R01 y AD01): el nombre y lo que más
// le importa. Mientras los datos cargan, solo saluda.
const reservas = (n) => `${n} ${n === 1 ? 'reserva' : 'reservas'}`

export function resumenDelPanel({ rol, nombre, pendientes, semana }) {
  const saludo = `Hola, ${nombre.split(' ')[0]}.`

  if (rol === 'ResponsableDeAmbiente') {
    if (!semana) {
      return saludo
    }
    if (semana.aprobadas + semana.pendientes === 0) {
      return `${saludo} Esta semana no hay reservas en sus ambientes.`
    }
    const aprobadas = `${reservas(semana.aprobadas)} ${semana.aprobadas === 1 ? 'aprobada' : 'aprobadas'}`
    const pendientesDeLaSemana = `${semana.pendientes} ${semana.pendientes === 1 ? 'pendiente' : 'pendientes'}`
    return `${saludo} Esta semana, en sus ambientes: ${aprobadas} y ${pendientesDeLaSemana}.`
  }

  if (pendientes === undefined) {
    return saludo
  }

  if (rol === 'Administrador') {
    if (pendientes === 0) {
      return `${saludo} No hay reservas esperando su aprobación.`
    }
    return `${saludo} Hay ${reservas(pendientes)} que ${pendientes === 1 ? 'espera' : 'esperan'} su aprobación.`
  }

  return pendientes === 0
    ? `${saludo} No tiene reservas esperando aprobación.`
    : `${saludo} Tiene ${reservas(pendientes)} esperando la aprobación del administrador.`
}
