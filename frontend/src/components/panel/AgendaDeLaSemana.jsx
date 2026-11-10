import { useState } from 'react'
import { Link } from 'react-router'
import { ESTADOS_AMBIENTE } from '../../utils/formato'
import { Icono } from '../ui/Icono'
import { InsigniaDeEstado } from '../ui/InsigniaDeEstado'
import { bloquesDeLaAgenda, diasDeLaSemana, tituloDeLaSemana } from './agendaDeLaSemana'

const HORAS = Array.from({ length: 15 }, (_, indice) => `${String(7 + indice).padStart(2, '0')}:00`)
const ESTILOS = {
  Aprobada: 'border-exito bg-aprobada-fondo text-aprobada-texto',
  Pendiente: 'border-aviso bg-pendiente-fondo text-pendiente-texto',
}

const nombreDelDia = (fecha, formato) => new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', formato).replace('.', '')

// RF-13 (diseño R01): la agenda de la semana de cada ambiente a cargo del responsable, con las reservas aprobadas
// (verde) y pendientes (ámbar) entre las 07:00 y las 22:00. Se elige el ambiente y se pasa de una semana a otra; cada
// bloque lleva al detalle. En pantallas anchas es una cuadrícula de lunes a domingo; en el teléfono, una lista por día.
//   reservas: las de la semana de todos sus ambientes; la agenda muestra las del ambiente elegido.
export function AgendaDeLaSemana({ ambientes, reservas, lunes, cargando, alCambiarSemana }) {
  const [idElegido, setIdElegido] = useState(null)
  const elegido = ambientes.find((ambiente) => ambiente.id_ambiente === idElegido) ?? ambientes[0]
  const dias = diasDeLaSemana(lunes)
  const bloques = elegido ? bloquesDeLaAgenda(reservas.filter((reserva) => reserva.id_ambiente === elegido.id_ambiente), lunes) : []

  return (
    <section aria-labelledby="titulo-agenda" className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-5 sm:p-6">
      <div className="flex items-start gap-2.5">
        <Icono nombre="reservas" className="mt-0.5 size-5 text-foco" />
        <div>
          <h2 id="titulo-agenda" className="text-lg font-semibold text-titulo">
            Agenda de la semana
          </h2>
          <p className="text-sm text-texto-suave">Reservas aprobadas y pendientes de cada ambiente a su cargo.</p>
        </div>
      </div>

      {ambientes.length === 0 ? (
        <p className="text-texto-suave">No tiene ambientes a su cargo. Los asigna el administrador al registrar el ambiente.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Ambiente">
              {ambientes.map((ambiente) => {
                const activo = ambiente.id_ambiente === elegido.id_ambiente
                return (
                  <button
                    key={ambiente.id_ambiente}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setIdElegido(ambiente.id_ambiente)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold transition focus-visible:outline-3 focus-visible:outline-foco ${activo ? 'border-marca-700 bg-marca-700 text-white' : 'border-borde-control bg-superficie text-texto hover:bg-superficie-tenue'}`}
                  >
                    {ambiente.nombre_ambiente}
                    {ambiente.estado_ambiente !== 'Disponible' && (
                      <span className="rounded-full bg-pendiente-fondo px-2 py-0.5 text-xs text-pendiente-texto">
                        {ESTADOS_AMBIENTE[ambiente.estado_ambiente]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <BotonDeSemana icono="anterior" nombre="Semana anterior" onClick={() => alCambiarSemana(-1)} />
              <p aria-live="polite" className="min-w-0 flex-1 text-center font-semibold text-texto lg:w-72 lg:flex-none">
                {tituloDeLaSemana(lunes)}
              </p>
              <BotonDeSemana icono="siguiente" nombre="Semana siguiente" onClick={() => alCambiarSemana(1)} />
            </div>
          </div>

          {cargando ? (
            <p className="text-texto-suave">Cargando la agenda…</p>
          ) : (
            <>
              <Cuadricula dias={dias} bloques={bloques} />
              <ListaPorDia dias={dias} bloques={bloques} />
            </>
          )}

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-texto-suave">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm border border-exito bg-aprobada-fondo" aria-hidden="true" /> Aprobada
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm border border-aviso bg-pendiente-fondo" aria-hidden="true" /> Pendiente
            </span>
            <span>Las rechazadas y las canceladas no ocupan el ambiente: no aparecen. Toque un bloque para ver el detalle.</span>
          </p>
        </>
      )}
    </section>
  )
}

function BotonDeSemana({ icono, nombre, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={nombre}
      title={nombre}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-borde-control bg-superficie text-texto transition hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco"
    >
      <Icono nombre={icono} />
    </button>
  )
}

// Escritorio: las horas a la izquierda y un día por columna; cada hora mide 40 px.
function Cuadricula({ dias, bloques }) {
  return (
    <div className="hidden grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] md:grid" aria-hidden="false">
      <span />
      {dias.map((dia) => (
        <p key={dia} className="pb-2 text-sm font-semibold text-texto-suave uppercase">
          {nombreDelDia(dia, { weekday: 'short' })} {Number(dia.slice(8))}
        </p>
      ))}
      <div className="relative h-[37.5rem]">
        {HORAS.map((hora, indice) => (
          <span key={hora} className="absolute -translate-y-1/2 text-xs text-texto-suave tabular-nums" style={{ top: `${(indice / 15) * 100}%` }}>
            {hora}
          </span>
        ))}
      </div>
      {dias.map((dia, indice) => (
        <div
          key={dia}
          className="relative h-[37.5rem] border-l border-borde bg-[repeating-linear-gradient(to_bottom,var(--color-borde)_0_1px,transparent_1px_2.5rem)]"
        >
          {bloques
            .filter((bloque) => bloque.dia === indice)
            .map(({ reserva, arriba, alto }) => (
              <Link
                key={reserva.id_reserva}
                to={`/reservas/${reserva.id_reserva}`}
                aria-label={`${reserva.codigo_reserva}, ${reserva.estado_reserva.toLowerCase()}, ${nombreDelDia(dia, { weekday: 'long', day: 'numeric' })}, de ${reserva.hora_inicio_reserva} a ${reserva.hora_fin_reserva}, ${reserva.nombre_completo_usuario}`}
                className={`absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-xs leading-tight hover:brightness-95 focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-foco ${ESTILOS[reserva.estado_reserva]}`}
                style={{ top: `${arriba}%`, height: `${alto}%` }}
              >
                <span className="block font-semibold">{reserva.codigo_reserva}</span>
                <span className="block tabular-nums">
                  {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva} · {reserva.nombre_completo_usuario}
                </span>
              </Link>
            ))}
        </div>
      ))}
    </div>
  )
}

// Teléfono: los días que tienen reservas, cada uno con su lista.
function ListaPorDia({ dias, bloques }) {
  const conReservas = dias.filter((_, indice) => bloques.some((bloque) => bloque.dia === indice))
  if (conReservas.length === 0) {
    return <p className="text-texto-suave md:hidden">Este ambiente no tiene reservas esta semana.</p>
  }
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {conReservas.map((dia) => (
        <div key={dia}>
          <h3 className="mb-1 font-semibold text-texto first-letter:uppercase">{nombreDelDia(dia, { weekday: 'long', day: 'numeric' })}</h3>
          <ul className="flex flex-col gap-2">
            {bloques
              .filter((bloque) => bloque.dia === dias.indexOf(dia))
              .sort((a, b) => a.arriba - b.arriba)
              .map(({ reserva }) => (
                <li key={reserva.id_reserva}>
                  <Link
                    to={`/reservas/${reserva.id_reserva}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-borde px-3 py-2 hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold tabular-nums">
                        {reserva.hora_inicio_reserva} a {reserva.hora_fin_reserva}
                      </span>
                      <span className="block text-sm text-texto-suave">
                        {reserva.codigo_reserva} · {reserva.nombre_completo_usuario}
                      </span>
                    </span>
                    <InsigniaDeEstado estado={reserva.estado_reserva} />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
