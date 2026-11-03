import { ESTADOS_RESERVA, opcionesDe } from '../../utils/formato'
import { Button } from '../ui/Button'
import { DateInput } from '../ui/DateInput'
import { SelectInput } from '../ui/SelectInput'

// Filtros del listado (RF-05). Cada cambio se aplica al momento; «Quitar filtros» vuelve a la lista completa.
// «alcance» depende del rol del usuario actual: el solicitante ve primero sus reservas y el responsable, las de sus
// ambientes; el administrador ve todas.
export function FiltrosDeReservas({ filtros, ambientes, alcance, alCambiar, alQuitar }) {
  const opcionesDeAmbiente = ambientes.map((ambiente) => ({ valor: ambiente.id_ambiente, etiqueta: ambiente.nombre_ambiente }))
  const hayFiltros = filtros.estado_reserva || filtros.id_ambiente || filtros.fecha_reserva

  return (
    <section aria-label="Filtros" className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput
          id="filtro-estado"
          etiqueta="Estado"
          opcional
          textoVacio="Todos los estados"
          opciones={opcionesDe(ESTADOS_RESERVA)}
          valor={filtros.estado_reserva}
          onCambiar={(valor) => alCambiar('estado_reserva', valor)}
        />
        <SelectInput
          id="filtro-ambiente"
          etiqueta="Ambiente"
          opcional
          textoVacio="Todos los ambientes"
          opciones={opcionesDeAmbiente}
          valor={filtros.id_ambiente}
          onCambiar={(valor) => alCambiar('id_ambiente', valor)}
        />
        <DateInput
          id="filtro-fecha"
          etiqueta="Fecha"
          valor={filtros.fecha_reserva}
          onCambiar={(valor) => alCambiar('fecha_reserva', valor)}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {alcance ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={alcance.activo}
              onChange={(evento) => alcance.alCambiar(evento.target.checked)}
              className="size-5 accent-foco"
            />
            {alcance.texto}
          </label>
        ) : (
          <span />
        )}
        <Button onClick={alQuitar} disabled={!hayFiltros}>
          Quitar filtros
        </Button>
      </div>
    </section>
  )
}
