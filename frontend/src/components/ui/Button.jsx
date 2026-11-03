import { Link } from 'react-router'

// Botón reutilizable del sistema (componente «Button» del caso). Con «destino» se dibuja como enlace de la SPA
// (para ir a otra página); sin él, como <button> (para actuar). Se ven igual, pero cada uno usa el elemento correcto.
// «ocupado» lo desactiva y lo anuncia (aria-busy) mientras la acción está en curso: evita el doble envío.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-colors ' +
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTES = {
  principal: 'bg-marca-700 text-white hover:bg-marca-800',
  secundario: 'border border-borde-control bg-superficie text-texto hover:bg-superficie-tenue',
  aprobar: 'bg-aprobar text-white hover:bg-aprobar-oscuro',
  peligro: 'bg-peligro text-white hover:bg-peligro-oscuro',
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
