import { useEffect, useState } from 'react'
import { ESTADOS_RESERVA } from '../../utils/formato'
import { ChipsDeFiltro } from '../ui/ChipsDeFiltro'
import { DateInput } from '../ui/DateInput'
import { Icono } from '../ui/Icono'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'

const ESPERA_MS = 350

const ESTADOS_EN_PLURAL = {
  Pendiente: 'Pendientes',
  Aprobada: 'Aprobadas',
  Rechazada: 'Rechazadas',
  Cancelada: 'Canceladas',
}

// Filtros del listado (RF-05, diseños S09 y AD04): chips por estado con su conteo, ambiente, rango de fechas y búsqueda
// por código o solicitante. Cada cambio se aplica al momento; la búsqueda espera a que la persona deje de escribir.
// «Limpiar filtros» vuelve a la lista completa (y conserva el alcance del rol si seguía puesto).
// «alcance» depende del rol: el solicitante ve primero sus reservas y el responsable, las de sus ambientes; se quita
// con la ✕ del chip. El administrador ve todas.
export function FiltrosDeReservas({ filtros, ambientes, conteos, alcance, alCambiar, alQuitar }) {
  const opcionesDeAmbiente = ambientes.map((ambiente) => ({ valor: ambiente.id_ambiente, etiqueta: ambiente.nombre_ambiente }))
  const hayFiltros = Object.values(filtros).some(Boolean) || Boolean(alcance?.activo)
  const [texto, setTexto] = useState(filtros.texto)
  const [textoAplicado, setTextoAplicado] = useState(filtros.texto)

  // Si el filtro cambia desde afuera (Limpiar filtros, «atrás»), el buscador lo muestra. Si cambió porque se aplicó lo
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

  const chipsDeEstado = [
    { valor: '', etiqueta: 'Todas', cantidad: conteos.total },
    ...Object.entries(ESTADOS_RESERVA).map(([valor]) => ({
      valor,
      etiqueta: ESTADOS_EN_PLURAL[valor],
      cantidad: conteos[valor] ?? 0,
    })),
  ]

  return (
    <section aria-label="Filtros" className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
      <div className="flex flex-wrap items-center gap-2">
        <ChipsDeFiltro
          etiqueta="Filtrar por estado"
          opciones={chipsDeEstado}
          valor={filtros.estado_reserva}
          alCambiar={(valor) => alCambiar('estado_reserva', valor)}
        />
        {alcance?.activo && (
          <button
            type="button"
            onClick={() => alcance.alCambiar(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-marca-700 bg-seleccion px-4 font-semibold text-enlace transition hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco"
          >
            {alcance.texto}
            <Icono nombre="cerrar" className="size-4" />
            <span className="sr-only">Quitar este filtro y ver todas</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_10rem_minmax(0,1.6fr)]">
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
          <div className="sm:col-span-2 xl:col-span-1">
            <TextInput
              id="filtro-texto"
              etiqueta="Buscar"
              type="search"
              valor={texto}
              onCambiar={setTexto}
              maxLength={100}
              placeholder="Código o solicitante"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={alQuitar}
          disabled={!hayFiltros}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 font-semibold text-enlace underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-foco disabled:cursor-not-allowed disabled:text-texto-suave disabled:no-underline xl:self-end"
        >
          <Icono nombre="cerrar" className="size-4" />
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}
