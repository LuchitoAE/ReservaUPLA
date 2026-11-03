import { useEffect, useState } from 'react'
import { consultarDisponibilidad } from '../api/reservasApi'
import { avisoDeError } from '../utils/avisoDeError'

const ESPERA_MS = 350
const EN_ESPERA = { estado: 'espera', mensaje: null, reservasDelDia: [] }
const CONSULTANDO = { estado: 'consultando', mensaje: null, reservasDelDia: [] }

// RF-04 mientras se llena el formulario: cuando ambiente, fecha y horas son válidos, pregunta a la API si el horario
// está libre. Espera a que el usuario deje de escribir (350 ms) y descarta respuestas de un horario anterior.
// Cada respuesta se guarda con la «clave» del horario consultado: si el horario cambió, todavía se está consultando.
// estado: 'espera' (faltan datos) | 'consultando' | 'libre' | 'ocupado' | 'error'
export function useDisponibilidad(horario, completo) {
  const { id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva } = horario
  const clave = completo ? [id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva].join('|') : null
  const [resultado, setResultado] = useState({ clave: null })

  useEffect(() => {
    if (!clave) {
      return undefined
    }

    let vigente = true
    const temporizador = setTimeout(() => {
      consultarDisponibilidad({ id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva })
        .then(({ data }) => {
          if (vigente) {
            setResultado({
              clave,
              estado: data.disponible ? 'libre' : 'ocupado',
              mensaje: data.mensaje,
              reservasDelDia: data.reservas_del_dia,
            })
          }
        })
        .catch((error) => {
          if (vigente) {
            setResultado({ clave, estado: 'error', mensaje: avisoDeError(error).mensaje, reservasDelDia: [] })
          }
        })
    }, ESPERA_MS)

    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
    // La clave ya reúne los cuatro datos del horario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  if (!clave) {
    return EN_ESPERA
  }
  return resultado.clave === clave ? resultado : CONSULTANDO
}
