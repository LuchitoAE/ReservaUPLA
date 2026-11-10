// Etiqueta de estado en píldora, sin ícono (diseños AD12, AD15 y R05): el texto dice el estado y el color lo refuerza,
// nunca al revés (WCAG 1.4.1). «tono» elige la familia de color: éxito, aviso, neutro o error.
const TONOS = {
  exito: 'bg-aprobada-fondo text-aprobada-texto',
  aviso: 'bg-pendiente-fondo text-pendiente-texto',
  neutro: 'bg-cancelada-fondo text-cancelada-texto',
  error: 'bg-rechazada-fondo text-rechazada-texto',
}

export function EtiquetaDeEstado({ estado, tono = 'neutro' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap ${TONOS[tono]}`}>
      {estado}
    </span>
  )
}

// El estado de un ambiente, con el nombre que ve la persona (diseños AD12 y R05).
const AMBIENTES = {
  Disponible: { etiqueta: 'Disponible', tono: 'exito' },
  EnMantenimiento: { etiqueta: 'En mantenimiento', tono: 'aviso' },
  Inactivo: { etiqueta: 'Inactivo', tono: 'neutro' },
}

export function EtiquetaDeAmbiente({ estado }) {
  const { etiqueta, tono } = AMBIENTES[estado]
  return <EtiquetaDeEstado estado={etiqueta} tono={tono} />
}
