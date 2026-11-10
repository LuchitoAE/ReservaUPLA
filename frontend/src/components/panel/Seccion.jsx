import { Link } from 'react-router'

// Una tarjeta del panel principal: título, una línea que la explica y, si hay más, un enlace a la lista completa.
export function Seccion({ id, titulo, descripcion, enlace, children }) {
  return (
    <section aria-labelledby={`titulo-${id}`} className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`titulo-${id}`} className="text-lg font-semibold text-titulo">
            {titulo}
          </h2>
          {descripcion && <p className="text-sm text-texto-suave">{descripcion}</p>}
        </div>
        {enlace && (
          <Link
            to={enlace.destino}
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 font-semibold text-enlace underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-foco"
          >
            {enlace.texto} →<span className="sr-only">: {titulo.toLowerCase()}</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
