import { Icono } from '../ui/Icono'
import { tituloDeLaSemana } from './agendaDeLaSemana'

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

// Semana que muestra la agenda: el título en el centro y un botón a cada lado para pasar a la anterior o a la siguiente.
export function SelectorDeSemana({ lunes, alCambiarSemana }) {
  return (
    <div className="flex items-center gap-2">
      <BotonDeSemana icono="anterior" nombre="Semana anterior" onClick={() => alCambiarSemana(-1)} />
      <p aria-live="polite" className="min-w-0 flex-1 text-center font-semibold text-texto lg:w-72 lg:flex-none">
        {tituloDeLaSemana(lunes)}
      </p>
      <BotonDeSemana icono="siguiente" nombre="Semana siguiente" onClick={() => alCambiarSemana(1)} />
    </div>
  )
}
