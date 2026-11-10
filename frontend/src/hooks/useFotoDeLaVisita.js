import { useEffect, useState } from 'react'
import { fotoDeLaVisita } from '../components/autenticacion/agendaDelCampus'
import { guardarPreferencia, leerPreferencia } from '../utils/almacenamientoLocal'

const CLAVE = 'reservaupla.fotoDelIngreso'

// La foto del panel del ingreso cambia entre visitas (1 → 2 → 3 → 4), nunca mientras la persona escribe (RNF-06).
// Se elige una sola vez al abrir el ingreso; el efecto solo recuerda cuál se mostró.
export function useFotoDeLaVisita() {
  const [foto] = useState(() => fotoDeLaVisita(leerPreferencia(CLAVE)))

  useEffect(() => {
    guardarPreferencia(CLAVE, String(foto))
  }, [foto])

  return foto
}
