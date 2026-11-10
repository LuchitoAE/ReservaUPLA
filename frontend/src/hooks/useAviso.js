import { useContext } from 'react'
import { contextoDeAvisos } from '../avisos/contextoDeAvisos'

// Lo que usa una página para avisar el resultado de una acción: mostrar({ tipo, titulo, texto, persistente }). La
// página no sabe dónde aparece el aviso ni si suena (patrón Observer).
export function useAviso() {
  return useContext(contextoDeAvisos).mostrar
}
