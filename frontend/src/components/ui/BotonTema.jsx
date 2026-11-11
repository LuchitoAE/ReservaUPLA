import { useTema } from '../../hooks/useTema'
import { Icono } from './Icono'

// Botón de modo claro u oscuro. El ícono es la convención conocida (sol y luna) y muestra el modo al que se pasa;
// su nombre lo dice para el lector de pantalla y al pasar el puntero (significante, Norman). «claro»: para fondos
// oscuros (barra lateral); si no, para fondos claros.
export function BotonTema({ sobreFondoOscuro = false, className = '' }) {
  const { tema, alternar } = useTema()
  const siguiente = tema === 'oscuro' ? 'claro' : 'oscuro'
  const nombre = `Cambiar a modo ${siguiente}`

  const colores = sobreFondoOscuro
    ? 'border-white/40 text-white hover:bg-white/10 active:bg-white/20 focus-visible:outline-acento'
    : 'border-borde-control bg-superficie text-texto hover:bg-superficie-tenue active:bg-seleccion focus-visible:outline-foco'

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={nombre}
      title={nombre}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg border transition active:translate-y-px focus-visible:outline-3 ${colores} ${className}`}
    >
      <Icono nombre={siguiente === 'oscuro' ? 'luna' : 'sol'} />
    </button>
  )
}
