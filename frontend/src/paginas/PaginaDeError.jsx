import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Icono } from '../components/ui/Icono'

// Si algo falla al dibujar una página, el usuario ve qué pasó con palabras y cómo seguir, no el detalle técnico
// (Shneiderman: manejo simple de errores). El detalle queda en la consola del navegador para quien lo corrija.
export function PaginaDeError() {
  const error = useRouteError()
  console.error(error)
  const noExiste = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex min-h-screen items-center justify-center bg-fondo p-6">
      <title>Algo salió mal · ReservaUPLA</title>
      <section className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-rechazada-fondo text-rechazada-texto" aria-hidden="true">
          <Icono nombre="error" className="size-6" />
        </span>
        <h1 className="text-2xl font-bold text-titulo">{noExiste ? 'Página no encontrada' : 'Algo salió mal'}</h1>
        <p className="text-texto-suave">
          {noExiste
            ? 'La dirección no existe en ReservaUPLA.'
            : 'La página no se pudo mostrar. Recárguela; si vuelve a pasar, avise al administrador del sistema.'}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-marca-700 px-5 font-semibold text-white transition hover:bg-marca-800 active:translate-y-px"
          >
            <Icono nombre="reintentar" />
            Recargar la página
          </button>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-borde-control px-5 font-semibold text-texto transition hover:bg-superficie-tenue active:translate-y-px"
          >
            <Icono nombre="inicio" />
            Ir al inicio
          </Link>
        </div>
      </section>
    </div>
  )
}
