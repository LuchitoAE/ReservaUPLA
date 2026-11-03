import { useState } from 'react'
import { useParams } from 'react-router'
import { obtenerReserva } from '../api/reservasApi'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AccionesDeEstado } from '../components/reservas/AccionesDeEstado'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { EstadoBadge } from '../components/ui/EstadoBadge'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { avisoDeError } from '../utils/avisoDeError'
import { formatearFechaLarga, formatearMomento } from '../utils/fechas'
import { TIPOS_AMBIENTE } from '../utils/formato'

const MIGAS = [{ nombre: 'Reservas', ruta: '/reservas' }]

// RF-06: todo sobre una reserva, agrupado por lo que el usuario busca: cuándo, dónde, quién y para qué.
// RF-07: al lado, las acciones de estado que el usuario actual puede hacer.
export function DetalleReserva() {
  const { idReserva } = useParams()
  const { usuarioActual } = useUsuarioActual()
  const { datos: reserva, cargando, error, recargar } = useConsulta(() => obtenerReserva(idReserva), [idReserva])
  const [avisoDeCambio, setAvisoDeCambio] = useState(null)

  if (cargando && !reserva) {
    return (
      <>
        <EncabezadoDePagina titulo="Reserva" migas={MIGAS} />
        <p role="status" className="text-texto-suave">
          Cargando la reserva…
        </p>
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
      {avisoDeCambio && <AlertMessage tipo="exito" titulo={avisoDeCambio} className="mb-4" />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="titulo-datos" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
          <h2 id="titulo-datos" className="mb-4 text-lg font-semibold text-titulo">
            Datos de la reserva
          </h2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr]">
            <Dato nombre="Estado">
              <EstadoBadge estado={reserva.estado_reserva} />
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
            <Dato nombre="Registrada">{formatearMomento(reserva.fecha_registro_reserva)}</Dato>
            {reserva.fecha_actualizacion_reserva && (
              <Dato nombre="Último cambio">{formatearMomento(reserva.fecha_actualizacion_reserva)}</Dato>
            )}
          </dl>
        </section>
        <aside className="flex flex-col gap-4 lg:self-start">
          <AccionesDeEstado
            reserva={reserva}
            usuarioActual={usuarioActual}
            alCambiar={(respuesta) => {
              setAvisoDeCambio(respuesta.message)
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
