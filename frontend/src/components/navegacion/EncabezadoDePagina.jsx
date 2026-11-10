// Encabezado de cada página: título, descripción y, si las hay, las acciones de la página. La ruta de navegación
// vive en la barra superior (BarraSuperior), no aquí. También pone el título de la pestaña del navegador, para que
// cada página se distinga en el historial.
export function EncabezadoDePagina({ titulo, descripcion, acciones }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <title>{`${titulo} · ReservaUPLA`}</title>
      <div className="min-w-0">
        <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold text-titulo focus:outline-none sm:text-3xl">
          {titulo}
        </h1>
        {descripcion && <p className="mt-1 text-texto-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-3">{acciones}</div>}
    </header>
  )
}
