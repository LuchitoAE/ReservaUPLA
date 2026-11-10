import { useEffect, useState } from 'react'
import { avanzarAgenda, estadoInicial, moverElegido } from '../components/autenticacion/agendaDelCampus'
import { guardarPreferencia, leerPreferencia } from '../utils/almacenamientoLocal'
import { useConsultaDeMedio } from './useConsultaDeMedio'
import { usePestanaVisible } from './usePestanaVisible'

export const ESCRITORIO = '(min-width: 64rem)' // el mismo corte que lg: de Tailwind
const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)'
const CLAVE_PAUSA = 'reservaupla.animacionDelIngreso'
const PASO_MS = 2400 // cada paso, un bloque pasa a color; cada dos pasos (4,8 s), el dorado cambia de bloque

// Animación «Agenda viva» del panel del ingreso (RNF-06). Solo se mueve en el escritorio, quieta si el sistema pide
// reducir el movimiento, detenida si la pestaña no está a la vista y con pausa a pedido (WCAG 2.2.2). La pausa se
// recuerda para la próxima visita.
export function useAgendaViva(encuadre) {
  const [estado, setEstado] = useState(() => estadoInicial(encuadre))
  const [pausada, setPausada] = useState(() => leerPreferencia(CLAVE_PAUSA) === 'pausada')
  const escritorio = useConsultaDeMedio(ESCRITORIO)
  const menosMovimiento = useConsultaDeMedio(MENOS_MOVIMIENTO)
  const visible = usePestanaVisible()
  const puedeMoverse = escritorio && !menosMovimiento
  const enMarcha = puedeMoverse && visible && !pausada

  useEffect(() => {
    if (!enMarcha) {
      return undefined
    }
    let paso = 0
    const reloj = setInterval(() => {
      paso += 1
      const moverDorado = paso % 2 === 0
      setEstado((actual) => {
        const siguiente = avanzarAgenda(actual)
        return moverDorado ? moverElegido(siguiente) : siguiente
      })
    }, PASO_MS)
    return () => clearInterval(reloj)
  }, [enMarcha])

  function alternarPausa() {
    const nueva = !pausada
    guardarPreferencia(CLAVE_PAUSA, nueva ? 'pausada' : 'en-marcha')
    setPausada(nueva)
  }

  return { estado, puedeMoverse, pausada, alternarPausa }
}
