import { useEffect, useRef, useState } from 'react'
import { ESTADOS_RESERVA } from '../../utils/formato'
import { ESPERA_DE_ESCRITURA_MS } from '../../utils/tiempos'
import { Button } from '../ui/Button'
import { ChipsDeFiltro } from '../ui/ChipsDeFiltro'
import { DateInput } from '../ui/DateInput'
import { Icono } from '../ui/Icono'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'
import { ESTADOS_EN_PLURAL } from './modeloDeFiltros'

const BASE_DEL_CHIP =
  'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold transition focus-visible:outline-3 focus-visible:outline-foco'
const CHIP_ACTIVO = 'border-marca-700 bg-seleccion text-enlace hover:bg-superficie-tenue'
const CHIP_INACTIVO = 'border-borde-control bg-superficie text-texto hover:bg-superficie-tenue'

// Filtros del listado (RF-05, diseños S09 y AD04): chips por estado con su conteo, ambiente, rango de fechas y búsqueda
// por código o solicitante. Cada cambio se aplica al momento; la búsqueda espera a que la persona deje de escribir.
// «Limpiar filtros» vuelve a la lista completa (y conserva el alcance del rol si seguía puesto).
// «alcance» depende del rol: el solicitante ve primero sus reservas y el responsable, las de sus ambientes; se quita
// con la ✕ del chip. El administrador ve todas.
export function FiltrosDeReservas({ filtros, ambientes, conteos, alcance, alCambiar, alQuitar }) {
  const opcionesDeAmbiente = ambientes.map((ambiente) => ({ valor: ambiente.id_ambiente, etiqueta: ambiente.nombre_ambiente }))
  // El alcance por defecto del rol no cuenta como filtro: «Limpiar filtros» solo se habilita si hay algo que quitar
  // (un filtro o el alcance cambiado a «ver todas»).
  const hayFiltros = Object.values(filtros).some(Boolean) || alcance?.activo === false
  const [texto, setTexto] = useState(filtros.texto)
  const textoExternoAnterior = useRef(filtros.texto)

  // Si el filtro cambia desde afuera (Limpiar filtros, «atrás»), el buscador lo muestra. Si cambió porque se aplicó lo
  // que la persona escribe, se deja tal cual (con su espacio final, si sigue escribiendo).
  useEffect(() => {
    if (filtros.texto === textoExternoAnterior.current) {
      return
    }
    textoExternoAnterior.current = filtros.texto
    setTexto((actual) => (filtros.texto === actual.trim() ? actual : filtros.texto))
  }, [filtros.texto])

  useEffect(() => {
    if (texto.trim() === filtros.texto) {
      return undefined
    }
    const temporizador = setTimeout(() => alCambiar('texto', texto.trim()), ESPERA_DE_ESCRITURA_MS)
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
        {alcance && (
          <button
            type="button"
            aria-pressed={alcance.activo}
            onClick={() => alcance.alCambiar(!alcance.activo)}
            className={`${BASE_DEL_CHIP} ${alcance.activo ? CHIP_ACTIVO : CHIP_INACTIVO}`}
          >
            {alcance.texto}
            {alcance.activo && <Icono nombre="cerrar" className="size-4" />}
            <span className="sr-only">
              {alcance.activo ? 'Quitar este filtro y ver todas' : 'Volver a ver solo lo mío'}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1.2fr)_10rem_10rem_minmax(0,1.2fr)]">
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
        <Button variante="secundario" onClick={alQuitar} disabled={!hayFiltros} className="self-start xl:mt-7">
          <Icono nombre="cerrar" className="size-4" />
          Limpiar filtros
        </Button>
      </div>
    </section>
  )
}
