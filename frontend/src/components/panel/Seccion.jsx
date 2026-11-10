import { Link } from 'react-router'
import { Icono } from '../ui/Icono'

// Una tarjeta del panel principal: ícono y título, una línea que la explica y, si hay más, un enlace a la lista
// completa con el chevron del diseño. El ícono es decorativo: el título ya dice qué hay dentro.
export function Seccion({ id, titulo, descripcion, icono, enlace, children }) {
  return (
    <section aria-labelledby={`titulo-${id}`} className="flex flex-col gap-3 rounded-xl border border-borde bg-superficie p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {icono && <Icono nombre={icono} className="mt-0.5 size-5 text-foco" />}
          <div>
            <h2 id={`titulo-${id}`} className="text-lg font-semibold text-titulo">
              {titulo}
            </h2>
            {descripcion && <p className="text-sm text-texto-suave">{descripcion}</p>}
          </div>
        </div>
        {enlace && (
          <Link
            to={enlace.destino}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 font-semibold text-enlace underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-foco"
          >
            {enlace.texto}
            <Icono nombre="siguiente" className="size-4" />
            <span className="sr-only">: {titulo.toLowerCase()}</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
