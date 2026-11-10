import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '../components/ui/Button'
import { Icono } from '../components/ui/Icono'

// Si algo falla al dibujar una página, el usuario ve qué pasó con palabras y cómo seguir, no el detalle técnico
// (Shneiderman: manejo simple de errores). El detalle queda en la consola del navegador para quien lo corrija.
// Ocupa la pantalla entera, sin menú: la aplicación no pudo dibujar la página que contenía el menú (diseño C06).
export function PaginaDeError() {
  const error = useRouteError()
  console.error(error)
  const noExiste = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex min-h-screen items-center justify-center bg-fondo p-6">
      <title>Algo salió mal · ReservaUPLA</title>
      <section className="flex w-full max-w-[35rem] flex-col gap-5 rounded-2xl border border-borde bg-superficie p-8 shadow-sm">
        <span
          className="flex size-11 items-center justify-center rounded-full bg-rechazada-fondo text-rechazada-texto"
          aria-hidden="true"
        >
          <Icono nombre="error" className="size-6" />
        </span>
        <h1 className="text-3xl font-bold text-titulo">{noExiste ? 'Página no encontrada' : 'Algo salió mal'}</h1>
        <p className="text-texto-suave">
          {noExiste
            ? 'La dirección no existe en ReservaUPLA.'
            : 'La página no se pudo mostrar. Recárguela; si vuelve a pasar, avise al administrador del sistema.'}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => window.location.reload()} variante="principal">
            <Icono nombre="reintentar" />
            Recargar la página
          </Button>
          <Button destino="/">
            <Icono nombre="inicio" />
            Ir al inicio
          </Button>
        </div>
      </section>
    </div>
  )
}
