import { useState } from 'react'
import { EstadoVacio } from '../ui/EstadoVacio'
import { Icono } from '../ui/Icono'
import { CuadriculaDeAgenda } from './CuadriculaDeAgenda'
import { ListaPorDia } from './ListaPorDia'
import { SelectorDeAmbiente } from './SelectorDeAmbiente'
import { SelectorDeSemana } from './SelectorDeSemana'
import { bloquesDeLaAgenda, diasDeLaSemana } from './agendaDeLaSemana'

// RF-13 (diseño R01): la agenda de la semana de cada ambiente a cargo del responsable, con las reservas aprobadas
// (verde) y pendientes (ámbar) entre las 07:00 y las 22:00. Se elige el ambiente y se pasa de una semana a otra; cada
// bloque lleva al detalle. En pantallas anchas es una cuadrícula de lunes a domingo; en el teléfono, una lista por día.
//   reservas: las de la semana de todos sus ambientes; la agenda muestra las del ambiente elegido.
export function AgendaDeLaSemana({ ambientes, reservas, lunes, cargando, alCambiarSemana }) {
  const [idElegido, setIdElegido] = useState(null)
  const elegido = ambientes.find((ambiente) => ambiente.id_ambiente === idElegido) ?? ambientes[0]
  const dias = diasDeLaSemana(lunes)
  const bloques = elegido
    ? bloquesDeLaAgenda(
        reservas.filter((reserva) => reserva.id_ambiente === elegido.id_ambiente),
        lunes,
      )
    : []

  return (
    <section
      aria-labelledby="titulo-agenda"
      className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
    >
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
        <EstadoVacio
          icono="ambientes"
          titulo="Aún no tiene ambientes a su cargo"
          texto="Cuando el administrador le asigne un ambiente, aquí verá su agenda de la semana: qué reservas tiene y a qué hora."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SelectorDeAmbiente ambientes={ambientes} elegido={elegido} alElegir={setIdElegido} />
            <SelectorDeSemana lunes={lunes} alCambiarSemana={alCambiarSemana} />
          </div>

          {cargando ? (
            <p className="text-texto-suave">Cargando la agenda…</p>
          ) : (
            <>
              <CuadriculaDeAgenda dias={dias} bloques={bloques} />
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
