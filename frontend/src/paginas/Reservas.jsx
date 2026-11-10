import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { listarAmbientes } from '../api/ambientesApi'
import { listarReservas } from '../api/reservasApi'
import { FiltrosDeReservas } from '../components/reservas/FiltrosDeReservas'
import { Button } from '../components/ui/Button'
import { ErrorDeCarga } from '../components/ui/ErrorDeCarga'
import { InsigniaDeEstado } from '../components/ui/InsigniaDeEstado'
import { TableList } from '../components/ui/TableList'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
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

// Qué parte de las reservas ve primero cada rol. El administrador, todas.
const ALCANCES = {
  Solicitante: { texto: 'Solo mis reservas', filtro: (usuario) => ({ id_usuario: usuario.id_usuario }) },
  ResponsableDeAmbiente: {
    texto: 'Solo los ambientes a mi cargo',
    filtro: (usuario) => ({ id_responsable_ambiente: usuario.id_usuario }),
  },
}

const ESTADOS_EN_PLURAL = {
  Pendiente: 'Pendientes',
  Aprobada: 'Aprobadas',
  Rechazada: 'Rechazadas',
  Cancelada: 'Canceladas',
}

// RF-05: reservas registradas, con búsqueda por código o solicitante y filtros por estado, ambiente y rango de fechas.
// Los filtros viven en la dirección
// (?estado_reserva=Pendiente): se pueden compartir, y «atrás» vuelve al filtro anterior.
export function Reservas() {
  const [parametros, setParametros] = useSearchParams()
  const { usuarioActual } = useUsuarioActual()
  const ambientes = useConsulta(() => listarAmbientes(), [])

  const filtros = {
    estado_reserva: parametros.get('estado_reserva') ?? '',
    id_ambiente: parametros.get('id_ambiente') ?? '',
    fecha_desde: parametros.get('fecha_desde') ?? '',
    fecha_hasta: parametros.get('fecha_hasta') ?? '',
    texto: parametros.get('texto') ?? '',
  }
  const alcance = usuarioActual ? ALCANCES[usuarioActual.rol_usuario] : null
  const soloLoMio = Boolean(alcance) && parametros.get('todas') !== '1'
  const filtroDeAlcance = soloLoMio ? alcance.filtro(usuarioActual) : {}

  const consulta = { ...filtros, ...filtroDeAlcance }
  const reservas = useConsulta(() => listarReservas(consulta), [JSON.stringify(consulta)])

  // Los chips muestran cuántas reservas hay en cada estado con el resto de los filtros puestos: se cuentan sin el
  // estado, para que al elegir uno los demás conteos sigan diciendo la verdad (diseño S09).
  const consultaSinEstado = { ...filtros, estado_reserva: '', ...filtroDeAlcance }
  const paraContar = useConsulta(() => listarReservas(consultaSinEstado), [JSON.stringify(consultaSinEstado)])
  const conteos = useMemo(() => {
    const lista = paraContar.datos ?? []
    const porEstado = Object.fromEntries(Object.keys(ESTADOS_EN_PLURAL).map((estado) => [estado, 0]))
    lista.forEach((reserva) => {
      if (reserva.estado_reserva in porEstado) {
        porEstado[reserva.estado_reserva] += 1
      }
    })
    return { total: lista.length, ...porEstado }
  }, [paraContar.datos])

  // La búsqueda la cambia un temporizador: la función es la misma en cada dibujo y lee la dirección del momento.
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
  const limpiarFiltros = () => setParametros({})

  // La lista se lee de la fecha más próxima a la más lejana (diseño AD04: «Fecha ↑»), sin depender del orden de la base.
  const lista = useMemo(
    () =>
      [...(reservas.datos ?? [])].sort((una, otra) =>
        `${una.fecha_reserva} ${una.hora_inicio_reserva}`.localeCompare(`${otra.fecha_reserva} ${otra.hora_inicio_reserva}`),
      ),
    [reservas.datos],
  )
  const cantidad = lista.length
  const sinConexion = reservas.error?.tipo === 'sin_conexion'

  return (
    <>
      <div className="flex flex-col gap-4">
        {!sinConexion && (
          <FiltrosDeReservas
            filtros={filtros}
            ambientes={ambientes.datos ?? []}
            conteos={conteos}
            alcance={
              alcance && {
                texto: alcance.texto,
                activo: soloLoMio,
                alCambiar: (activo) => cambiarParametro('todas', activo ? '' : '1'),
              }
            }
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
    </>
  )
}
