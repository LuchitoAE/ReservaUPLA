import { Link } from 'react-router'

// Botón reutilizable del sistema (componente «Button» del caso). Con «destino» se dibuja como enlace de la SPA
// (para ir a otra página); sin él, como <button> (para actuar). Se ven igual, pero cada uno usa el elemento correcto.
// Significante (Norman): forma de botón, relleno o borde, y cursor de mano. Feedback inmediato (Shneiderman): cambia
// al pasar el puntero (hover), se hunde al pulsarlo (active) y, mientras la acción está en curso («ocupado»), muestra
// un indicador, se desactiva y se anuncia (aria-busy): no se puede enviar dos veces.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition ' +
  'active:translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco ' +
  'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0'

const VARIANTES = {
  principal: 'bg-marca-700 text-white shadow-sm hover:bg-marca-800 active:bg-marca-900',
  blanco:
    'bg-white text-marca-700 shadow-sm hover:bg-marca-100 active:bg-marca-100 focus-visible:outline-white focus-visible:outline-offset-4',
  secundario: 'border border-borde-control bg-superficie text-texto hover:bg-superficie-tenue active:bg-seleccion',
  aprobar: 'bg-aprobar text-white shadow-sm hover:bg-aprobar-oscuro active:bg-aprobar-oscuro',
  peligro: 'bg-peligro text-white shadow-sm hover:bg-peligro-oscuro active:bg-peligro-oscuro',
}

export function Button({
  variante = 'secundario',
  destino,
  type = 'button',
  ocupado = false,
  disabled = false,
  className = '',
  children,
  ...propiedades
}) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`

  if (destino) {
    return (
      <Link to={destino} className={clases} {...propiedades}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled || ocupado} aria-busy={ocupado || undefined} className={clases} {...propiedades}>
      {ocupado && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
