import { Link } from 'react-router'

// Encabezado de cada página: migas (dónde estoy), título, descripción y, si las hay, las acciones de la página.
// También pone el título de la pestaña del navegador, para que cada página se distinga en el historial.
// «migas» es la lista de páginas intermedias: [{ nombre: 'Reservas', ruta: '/reservas' }].
export function EncabezadoDePagina({ titulo, descripcion, migas = [], acciones, conMigas = true }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <title>{`${titulo} · ReservaUPLA`}</title>
      <div className="min-w-0">
        {conMigas && (
          <nav aria-label="Ruta de navegación" className="mb-2 text-sm text-texto-suave">
            <ol className="flex flex-wrap items-center gap-1.5">
              {[{ nombre: 'Dashboard', ruta: '/' }, ...migas].map((miga) => (
                <li key={miga.ruta} className="flex items-center gap-1.5">
                  <Link to={miga.ruta} className="text-enlace underline underline-offset-2 hover:decoration-2">
                    {miga.nombre}
                  </Link>
                  <span aria-hidden="true">›</span>
                </li>
              ))}
              <li aria-current="page">{titulo}</li>
            </ol>
          </nav>
        )}
        <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold text-titulo focus:outline-none sm:text-3xl">
          {titulo}
        </h1>
        {descripcion && <p className="mt-1 text-texto-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-3">{acciones}</div>}
    </header>
  )
}
