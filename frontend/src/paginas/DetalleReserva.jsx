import { useParams } from 'react-router'
import { obtenerReserva } from '../api/reservasApi'
import { avisoDeReserva } from '../avisos/avisosDeReserva'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AccionesDeEstado } from '../components/reservas/AccionesDeEstado'
import { HistorialDeReserva } from '../components/reservas/HistorialDeReserva'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { Cargando } from '../components/ui/Cargando'
import { InsigniaDeEstado } from '../components/ui/InsigniaDeEstado'
import { useAviso } from '../hooks/useAviso'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { avisoDeError } from '../utils/avisoDeError'
import { formatearFechaLarga } from '../utils/fechas'
import { TIPOS_AMBIENTE } from '../utils/formato'

const MIGAS = [{ nombre: 'Reservas', ruta: '/reservas' }]

// RF-06: todo sobre una reserva, agrupado por lo que el usuario busca (cuándo, dónde, quién y para qué), y su historial.
// RF-07: al lado, en qué está y las acciones que el usuario actual puede hacer. El resultado de cada cambio sale en un
// aviso flotante con el color de su estado (RNF-04, RNF-05): nada empuja las tarjetas.
export function DetalleReserva() {
  const { idReserva } = useParams()
  const { usuarioActual } = useUsuarioActual()
  const { datos: reserva, cargando, error, recargar } = useConsulta(() => obtenerReserva(idReserva), [idReserva])
  const mostrarAviso = useAviso()

  if (cargando && !reserva) {
    return (
      <>
        <EncabezadoDePagina titulo="Reserva" migas={MIGAS} />
        <Cargando texto="Cargando la reserva…" />
      </>
    )
  }

  if (error) {
    return (
      <>
        <EncabezadoDePagina titulo="Reserva no encontrada" migas={MIGAS} />
        <div className="flex flex-col items-start gap-4">
          <AlertMessage tipo="error" aviso={avisoDeError(error)} className="self-stretch" />
          <Button destino="/reservas">Volver a reservas</Button>
        </div>
      </>
    )
  }

  return (
    <>
      <EncabezadoDePagina
        titulo={`Reserva ${reserva.codigo_reserva}`}
        descripcion={`${reserva.nombre_ambiente} · ${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva}`}
        migas={MIGAS}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="titulo-datos" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
            <h2 id="titulo-datos" className="mb-4 text-lg font-semibold text-titulo">
              Datos de la reserva
            </h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr]">
              <Dato nombre="Estado">
                <InsigniaDeEstado estado={reserva.estado_reserva} />
              </Dato>
              <Dato nombre="Fecha">
                <span className="inline-block first-letter:uppercase">{formatearFechaLarga(reserva.fecha_reserva)}</span>
              </Dato>
              <Dato nombre="Horario">
                <span className="tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                </span>
              </Dato>
              <Dato nombre="Ambiente">
                {reserva.nombre_ambiente}
                <span className="block text-sm text-texto-suave">
                  {TIPOS_AMBIENTE[reserva.tipo_ambiente]} · {reserva.capacidad_ambiente} personas · {reserva.ubicacion_ambiente}
                </span>
              </Dato>
              <Dato nombre="Solicitante">
                {reserva.nombre_completo_usuario}
                <span className="block text-sm text-texto-suave">{reserva.correo_usuario}</span>
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
          <Button destino="/reservas">Volver a reservas</Button>
        </aside>
      </div>
    </>
  )
}

function Dato({ nombre, children }) {
  return (
    <>
      <dt className="text-texto-suave">{nombre}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  )
}
