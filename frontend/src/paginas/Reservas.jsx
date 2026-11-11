import { useMemo } from 'react'
import { Link } from 'react-router'
import { listarAmbientes } from '../api/ambientesApi'
import { FiltrosDeReservas } from '../components/reservas/FiltrosDeReservas'
import { ordenarPorFecha } from '../components/reservas/modeloDeFiltros'
import { Button } from '../components/ui/Button'
import { ErrorDeCarga } from '../components/ui/ErrorDeCarga'
import { InsigniaDeEstado } from '../components/ui/InsigniaDeEstado'
import { TableList } from '../components/ui/TableList'
import { useConsulta } from '../hooks/useConsulta'
import { useFiltrosDeReservas } from '../hooks/useFiltrosDeReservas'
import { formatearFecha } from '../utils/fechas'

const COLUMNAS = [
  {
    clave: 'codigo_reserva',
    titulo: 'Código',
    ancho: 'w-[13%]',
    celda: (reserva) => (
      <Link to={`/reservas/${reserva.id_reserva}`} className="font-semibold whitespace-nowrap text-enlace underline underline-offset-2 hover:decoration-2">
        {reserva.codigo_reserva}
      </Link>
    ),
  },
  { clave: 'nombre_ambiente', titulo: 'Ambiente', ancho: 'w-[21%]' },
  { clave: 'fecha_reserva', titulo: 'Fecha', ancho: 'w-[11%]', celda: (reserva) => formatearFecha(reserva.fecha_reserva) },
  {
    clave: 'horario',
    titulo: 'Horario',
    ancho: 'w-[12%]',
    celda: (reserva) => (
      <span className="tabular-nums whitespace-nowrap">
        {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
      </span>
    ),
  },
  { clave: 'nombre_completo_usuario', titulo: 'Solicitante', ancho: 'w-[19%]' },
  { clave: 'estado_reserva', titulo: 'Estado', ancho: 'w-[14%]', celda: (reserva) => <InsigniaDeEstado estado={reserva.estado_reserva} /> },
]

// RF-05: reservas registradas, con búsqueda por código o solicitante y filtros por estado, ambiente y rango de fechas.
// Los filtros viven en la dirección (?estado_reserva=Pendiente): se pueden compartir, y «atrás» vuelve al filtro anterior.
export function Reservas() {
  const ambientes = useConsulta(() => listarAmbientes(), [])
  const { filtros, alcance, reservas, conteos, cambiarParametro, limpiarFiltros } = useFiltrosDeReservas()

  const lista = useMemo(() => ordenarPorFecha(reservas.datos ?? []), [reservas.datos])
  const cantidad = lista.length
  const sinConexion = reservas.error?.tipo === 'sin_conexion'

  return (
    <div className="flex flex-col gap-4">
      {!sinConexion && (
        <FiltrosDeReservas
          filtros={filtros}
          ambientes={ambientes.datos ?? []}
          conteos={conteos}
          alcance={alcance}
          alCambiar={cambiarParametro}
          alQuitar={limpiarFiltros}
        />
      )}
      {reservas.error && <ErrorDeCarga error={reservas.error} alReintentar={reservas.recargar} />}
      {!reservas.cargando && !reservas.error && (
        <p role="status" className="text-texto-suave">
          {cantidad === 0
            ? 'No se encontraron reservas.'
            : cantidad === 1
              ? 'Se encontró 1 reserva.'
              : `Se encontraron ${cantidad} reservas.`}
        </p>
      )}
      {!reservas.error && (
        <TableList
          titulo="Reservas"
          columnas={COLUMNAS}
          filas={lista}
          claveFila="id_reserva"
          cargando={reservas.cargando && !reservas.datos}
          vacio="No hay reservas con estos filtros."
          textoVacio="Cambie o quite un filtro para ver más reservas."
          iconoVacio="buscar"
          accionVacio={<Button onClick={limpiarFiltros}>Limpiar filtros</Button>}
          accion={{
            texto: 'Ver',
            destino: (reserva) => `/reservas/${reserva.id_reserva}`,
            describir: (reserva) => `la reserva ${reserva.codigo_reserva}`,
          }}
          notaPie="Toda la fila abre el detalle de la reserva."
        />
      )}
    </div>
  )
}
