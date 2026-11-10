import { Link, useSearchParams } from 'react-router'
import { listarAmbientes } from '../api/ambientesApi'
import { listarReservas } from '../api/reservasApi'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { FiltrosDeReservas } from '../components/reservas/FiltrosDeReservas'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { InsigniaDeEstado } from '../components/ui/InsigniaDeEstado'
import { TableList } from '../components/ui/TableList'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { avisoDeError } from '../utils/avisoDeError'
import { formatearFecha } from '../utils/fechas'

const COLUMNAS = [
  {
    clave: 'codigo_reserva',
    titulo: 'Código',
    celda: (reserva) => (
      <Link to={`/reservas/${reserva.id_reserva}`} className="font-semibold whitespace-nowrap text-enlace underline underline-offset-2 hover:decoration-2">
        {reserva.codigo_reserva}
      </Link>
    ),
  },
  { clave: 'fecha_reserva', titulo: 'Fecha', celda: (reserva) => formatearFecha(reserva.fecha_reserva) },
  {
    clave: 'horario',
    titulo: 'Horario',
    celda: (reserva) => (
      <span className="tabular-nums whitespace-nowrap">
        {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
      </span>
    ),
  },
  { clave: 'nombre_ambiente', titulo: 'Ambiente' },
  { clave: 'nombre_completo_usuario', titulo: 'Solicitante' },
  { clave: 'estado_reserva', titulo: 'Estado', celda: (reserva) => <InsigniaDeEstado estado={reserva.estado_reserva} /> },
]

// Qué parte de las reservas ve primero cada rol. El administrador, todas.
const ALCANCES = {
  Solicitante: { texto: 'Solo mis reservas', filtro: (usuario) => ({ id_usuario: usuario.id_usuario }) },
  ResponsableDeAmbiente: {
    texto: 'Solo los ambientes a mi cargo',
    filtro: (usuario) => ({ id_responsable_ambiente: usuario.id_usuario }),
  },
}

// RF-05: reservas registradas, con filtros por estado, ambiente y fecha. Los filtros viven en la dirección
// (?estado_reserva=Pendiente): se pueden compartir, y «atrás» vuelve al filtro anterior.
export function Reservas() {
  const [parametros, setParametros] = useSearchParams()
  const { usuarioActual } = useUsuarioActual()
  const ambientes = useConsulta(() => listarAmbientes(), [])

  const filtros = {
    estado_reserva: parametros.get('estado_reserva') ?? '',
    id_ambiente: parametros.get('id_ambiente') ?? '',
    fecha_reserva: parametros.get('fecha_reserva') ?? '',
  }
  const alcance = usuarioActual ? ALCANCES[usuarioActual.rol_usuario] : null
  const soloLoMio = Boolean(alcance) && parametros.get('todas') !== '1'
  const filtroDeAlcance = soloLoMio ? alcance.filtro(usuarioActual) : {}

  const consulta = { ...filtros, ...filtroDeAlcance }
  const reservas = useConsulta(() => listarReservas(consulta), [JSON.stringify(consulta)])

  function cambiarParametro(nombre, valor) {
    const nuevos = new URLSearchParams(parametros)
    if (valor) {
      nuevos.set(nombre, valor)
    } else {
      nuevos.delete(nombre)
    }
    setParametros(nuevos)
  }

  const cantidad = reservas.datos?.length ?? 0

  return (
    <>
      <EncabezadoDePagina
        titulo="Reservas"
        descripcion="Solicitudes registradas y su estado."
        acciones={
          <Button destino="/reservas/nueva" variante="principal">
            Nueva reserva
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <FiltrosDeReservas
          filtros={filtros}
          ambientes={ambientes.datos ?? []}
          alcance={alcance && { texto: alcance.texto, activo: soloLoMio, alCambiar: (activo) => cambiarParametro('todas', activo ? '' : '1') }}
          alCambiar={cambiarParametro}
          alQuitar={() => setParametros(parametros.get('todas') ? { todas: '1' } : {})}
        />
        {reservas.error && <AlertMessage tipo="error" aviso={avisoDeError(reservas.error)} />}
        {!reservas.cargando && !reservas.error && (
          <p role="status" className="text-texto-suave">
            {cantidad === 1 ? 'Se encontró 1 reserva.' : `Se encontraron ${cantidad} reservas.`}
          </p>
        )}
        <TableList
          titulo="Reservas"
          columnas={COLUMNAS}
          filas={reservas.datos ?? []}
          claveFila="id_reserva"
          cargando={reservas.cargando && !reservas.datos}
          vacio="No hay reservas con estos filtros."
        />
      </div>
    </>
  )
}
