import { useEffect, useState } from 'react'
import { ESTADOS_RESERVA, opcionesDe } from '../../utils/formato'
import { Button } from '../ui/Button'
import { DateInput } from '../ui/DateInput'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'

const ESPERA_MS = 350

// Filtros del listado (RF-05): buscar por código o solicitante, estado, ambiente y un rango de fechas. Cada cambio se
// aplica al momento; la búsqueda espera a que la persona deje de escribir. «Quitar filtros» vuelve a la lista completa.
// «alcance» depende del rol del usuario actual: el solicitante ve primero sus reservas y el responsable, las de sus
// ambientes; el administrador ve todas.
export function FiltrosDeReservas({ filtros, ambientes, alcance, alCambiar, alQuitar }) {
  const opcionesDeAmbiente = ambientes.map((ambiente) => ({ valor: ambiente.id_ambiente, etiqueta: ambiente.nombre_ambiente }))
  const hayFiltros = Object.values(filtros).some(Boolean)
  const [texto, setTexto] = useState(filtros.texto)
  const [textoAplicado, setTextoAplicado] = useState(filtros.texto)

  // Si el filtro cambia desde afuera (Quitar filtros, «atrás»), el buscador lo muestra. Si cambió porque se aplicó lo
  // que la persona escribe, se deja tal cual (con su espacio final, si sigue escribiendo).
  if (filtros.texto !== textoAplicado) {
    setTextoAplicado(filtros.texto)
    if (filtros.texto !== texto.trim()) {
      setTexto(filtros.texto)
    }
  }

  useEffect(() => {
    if (texto.trim() === filtros.texto) {
      return undefined
    }
    const temporizador = setTimeout(() => alCambiar('texto', texto.trim()), ESPERA_MS)
    return () => clearTimeout(temporizador)
  }, [texto, filtros.texto, alCambiar])

  return (
    <section aria-label="Filtros" className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-4">
      <TextInput
        id="filtro-texto"
        etiqueta="Buscar"
        type="search"
        valor={texto}
        onCambiar={setTexto}
        maxLength={100}
        ayuda="Por código (RES-2026-0001) o por el nombre de quien la solicitó."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          id="filtro-desde"
          etiqueta="Desde"
          valor={filtros.fecha_desde}
          maximo={filtros.fecha_hasta || undefined}
          onCambiar={(valor) => alCambiar('fecha_desde', valor)}
        />
        <DateInput
          id="filtro-hasta"
          etiqueta="Hasta"
          valor={filtros.fecha_hasta}
          minimo={filtros.fecha_desde || undefined}
          onCambiar={(valor) => alCambiar('fecha_hasta', valor)}
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
