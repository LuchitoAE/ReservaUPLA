import { useEffect, useEffectEvent, useState } from 'react'
import { consultarDisponibilidad } from '../api/reservasApi'
import { avisoDeError } from '../utils/avisoDeError'
import { ESPERA_DE_ESCRITURA_MS } from '../utils/tiempos'

const EN_ESPERA = { estado: 'espera', mensaje: null, reservasDelDia: [] }
const CONSULTANDO = { estado: 'consultando', mensaje: null, reservasDelDia: [] }

// RF-04 mientras se llena el formulario: cuando ambiente, fecha y horas son válidos, pregunta a la API si el horario
// está libre. Espera a que el usuario deje de escribir y descarta respuestas de un horario anterior.
// Cada respuesta se guarda con la «clave» del horario consultado: si el horario cambió, todavía se está consultando.
// estado: 'espera' (faltan datos) | 'consultando' | 'libre' | 'ocupado' | 'error'
export function useDisponibilidad(horario, completo) {
  const { id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva } = horario
  const clave = completo ? [id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva].join('|') : null
  const [resultado, setResultado] = useState({ clave: null })

  // La clave ya reúne los cuatro datos del horario; el evento lee la versión actual sin volver a suscribirse.
  const consultarVigente = useEffectEvent(() =>
    consultarDisponibilidad({ id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva }),
  )

  useEffect(() => {
    if (!clave) {
      return undefined
    }

    let vigente = true
    const temporizador = setTimeout(() => {
      consultarVigente()
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
    }, ESPERA_DE_ESCRITURA_MS)

    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [clave])

  if (!clave) {
    return EN_ESPERA
  }
  return resultado.clave === clave ? resultado : CONSULTANDO
}
