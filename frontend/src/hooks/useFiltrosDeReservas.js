import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { listarReservas } from '../api/reservasApi'
import { alcanceDelUsuario, contarPorEstado, leerFiltros } from '../components/reservas/modeloDeFiltros'
import { useConsulta } from './useConsulta'
import { useUsuarioActual } from './useUsuarioActual'

// Estado de los filtros del listado de reservas (RF-05): lee la dirección, arma las dos consultas (la lista y los
// conteos sin el estado) y ofrece las acciones que cambian la dirección. Así la página solo dibuja.
export function useFiltrosDeReservas() {
  const [parametros, setParametros] = useSearchParams()
  const { usuarioActual } = useUsuarioActual()

  const filtros = leerFiltros(parametros)
  const { alcance, soloLoMio, filtroDeAlcance } = alcanceDelUsuario(usuarioActual, parametros)

  const consulta = { ...filtros, ...filtroDeAlcance }
  const reservas = useConsulta(() => listarReservas(consulta), [JSON.stringify(consulta)])

  const consultaSinEstado = { ...filtros, estado_reserva: '', ...filtroDeAlcance }
  const paraContar = useConsulta(() => listarReservas(consultaSinEstado), [JSON.stringify(consultaSinEstado)])
  const conteos = useMemo(() => contarPorEstado(paraContar.datos ?? []), [paraContar.datos])

  const cambiarParametro = useCallback(
    (nombre, valor) => {
      setParametros((anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        if (valor) {
          nuevos.set(nombre, valor)
        } else {
          nuevos.delete(nombre)
        }
        return nuevos
      })
    },
    [setParametros],
  )

  // Limpiar vuelve a la vista inicial del rol: sin filtros y con «solo lo mío» otra vez.
  const limpiarFiltros = useCallback(() => setParametros({}), [setParametros])

  return {
    filtros,
    alcance: alcance && {
      texto: alcance.texto,
      activo: soloLoMio,
      alCambiar: (activo) => cambiarParametro('todas', activo ? '' : '1'),
    },
    reservas,
    conteos,
    cambiarParametro,
    limpiarFiltros,
  }
}
