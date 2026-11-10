import { useEffect } from 'react'
import { useParams } from 'react-router'
import { obtenerReserva } from '../api/reservasApi'
import { avisoDeReserva } from '../avisos/avisosDeReserva'
import { AccionesDeEstado } from '../components/reservas/AccionesDeEstado'
import { HistorialDeReserva } from '../components/reservas/HistorialDeReserva'
import { Cargando } from '../components/ui/Cargando'
import { ErrorDeCarga } from '../components/ui/ErrorDeCarga'
import { Icono } from '../components/ui/Icono'
import { InsigniaDeEstado } from '../components/ui/InsigniaDeEstado'
import { useBandaDePagina } from '../contexto/contextoBanda'
import { useMigaDePagina } from '../contexto/contextoMiga'
import { useAviso } from '../hooks/useAviso'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { formatearFechaLarga } from '../utils/fechas'
import { ROLES } from '../utils/formato'
import { esIdentificadorDeReserva } from '../utils/identificadores'
import { PaginaNoEncontrada } from './PaginaNoEncontrada'

// '14:00' y '16:00' → '2 horas' (la línea que acompaña al horario en el detalle, diseño AD06).
function duracion(inicio, fin) {
  const [horasInicio, minutosInicio] = inicio.split(':').map(Number)
  const [horasFin, minutosFin] = fin.split(':').map(Number)
  const minutos = horasFin * 60 + minutosFin - (horasInicio * 60 + minutosInicio)
  const horas = minutos / 60
  const texto = Number.isInteger(horas) ? String(horas) : horas.toFixed(1).replace('.', ',')
  return `${texto} ${horas === 1 ? 'hora' : 'horas'}`
}

// RF-06: todo sobre una reserva, agrupado por lo que el usuario busca (cuándo, dónde, quién y para qué), y su historial.
// RF-07: al lado, en qué está y las acciones que el usuario actual puede hacer. El resultado de cada cambio sale en un
// aviso flotante con el color de su estado (RNF-04, RNF-05): nada empuja las tarjetas.
// El estado va junto al título y «Volver a reservas» arriba a la derecha (diseños AD06, S11 y R04).
export function DetalleReserva() {
  const { idReserva } = useParams()
  const { usuarioActual } = useUsuarioActual()
  const { datos: reserva, cargando, error, recargar } = useConsulta(() => obtenerReserva(idReserva), [idReserva])
  const mostrarAviso = useAviso()
  const { fijarMiga } = useMigaDePagina() ?? {}
  const { fijarBanda } = useBandaDePagina() ?? {}
  const idValido = esIdentificadorDeReserva(idReserva)

  // La barra superior muestra el código de la reserva en cuanto se conoce (AD06, AD08 y AD09); mientras carga queda
  // «Reserva» (C08). Al salir de la página se borra para no dejarlo en la miga de otra pantalla.
  useEffect(() => {
    fijarMiga?.(reserva?.codigo_reserva ?? null)
    return () => fijarMiga?.(null)
  }, [reserva?.codigo_reserva, fijarMiga])

  // La banda muestra el código y el estado cuando llegan; mientras tanto queda «Reserva» y, si falla, dice qué pasó.
  useEffect(() => {
    if (!idValido) {
      return undefined
    }
    if (error) {
      const noEncontrada = error.tipo === 'no_encontrado'
      fijarBanda?.({
        titulo: noEncontrada ? 'Reserva no encontrada' : 'No se pudo cargar la reserva',
        descripcion: noEncontrada ? 'No existe una reserva con el identificador indicado.' : null,
        insignia: null,
      })
    } else if (reserva) {
      fijarBanda?.({
        titulo: `Reserva ${reserva.codigo_reserva}`,
        descripcion: `${reserva.nombre_ambiente} · ${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva}`,
        insignia: <InsigniaDeEstado estado={reserva.estado_reserva} />,
      })
    } else {
      fijarBanda?.(null)
    }
    return () => fijarBanda?.(null)
  }, [idValido, fijarBanda, reserva, error])

  // «/reservas/nuevas» no es el detalle de ninguna reserva: es una dirección que no existe (diseño C02).
  if (!idValido) {
    return <PaginaNoEncontrada />
  }

  if (cargando && !reserva) {
    return <Cargando texto="Cargando la reserva…" />
  }

  if (error) {
    const noEncontrada = error.tipo === 'no_encontrado'
    return (
      <div className="flex flex-col items-start gap-4">
        {noEncontrada ? (
          <p className="self-stretch rounded-xl border border-borde bg-superficie p-6 shadow-tarjeta">
            Puede que la dirección esté incompleta. Búsquela en el listado por su código.
          </p>
        ) : (
          <ErrorDeCarga error={error} alReintentar={recargar} />
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="titulo-datos" className="rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6">
            <div className="flex items-center gap-2.5">
              <Icono nombre="reservas" className="size-5 text-foco" />
              <h2 id="titulo-datos" className="text-lg font-semibold text-titulo">
                Datos de la reserva
              </h2>
            </div>
            <dl className="mt-2 flex flex-col divide-y divide-borde">
              <Dato nombre="Ambiente">
                {reserva.nombre_ambiente}
                <span className="block text-sm text-texto-suave">
                  {reserva.capacidad_ambiente} personas · {reserva.ubicacion_ambiente}
                </span>
              </Dato>
              <Dato nombre="Fecha">
                <span className="inline-block first-letter:uppercase">{formatearFechaLarga(reserva.fecha_reserva)}</span>
              </Dato>
              <Dato nombre="Horario">
                <span className="tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                </span>
                <span className="block text-sm text-texto-suave">
                  {duracion(reserva.hora_inicio_reserva, reserva.hora_fin_reserva)}
                </span>
              </Dato>
              <Dato nombre="Solicitante">
                {reserva.nombre_completo_usuario}
                <span className="block text-sm text-texto-suave">
                  {reserva.codigo_usuario} · {ROLES[reserva.rol_usuario]}
                </span>
              </Dato>
              <Dato nombre="Motivo">
                <span className="whitespace-pre-line">{reserva.motivo_reserva}</span>
              </Dato>
            </dl>
          </section>
          <HistorialDeReserva historial={reserva.historial_reserva} />
        </div>
        <aside className="flex flex-col gap-4 lg:self-start">
          <AccionesDeEstado
            reserva={reserva}
            usuarioActual={usuarioActual}
            alCambiar={(respuesta) => {
              mostrarAviso(avisoDeReserva(respuesta.data))
              recargar()
            }}
          />
        </aside>
    </div>
  )
}

function Dato({ nombre, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-texto-suave">{nombre}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}
