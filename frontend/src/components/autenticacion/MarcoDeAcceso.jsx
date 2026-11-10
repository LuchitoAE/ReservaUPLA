import { BotonTema } from '../ui/BotonTema'
import { AgendaDelCampus } from './AgendaDelCampus'

// Estructura de la pantalla de ingreso (AC01): el panel «Agenda del campus» a la izquierda y el formulario en una
// tarjeta a la derecha, 65/35 con un mínimo de 448 px para el formulario. Por debajo de 1024 px, una sola columna:
// el panel queda arriba, como franja. El logo es un recurso institucional de la UPLA, solo para este prototipo
// académico.
export function MarcoDeAcceso({ titulo, descripcion, tituloPestana, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,65fr)_minmax(28rem,35fr)]">
      <title>{`${tituloPestana} · ReservaUPLA`}</title>
      <AgendaDelCampus />
      {/* En una columna, la tarjeta empieza debajo del botón de tema (antes lo tapaba en el teléfono). */}
      <main className="relative flex items-center justify-center bg-fondo px-4 pt-20 pb-10 sm:px-8 lg:py-10">
        <BotonTema className="absolute top-4 right-4" />
        <section className="w-full max-w-md rounded-2xl border border-borde bg-superficie p-6 shadow-sm sm:p-8">
          <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold text-titulo focus:outline-none">
            {titulo}
          </h1>
          <p className="mt-1 mb-6 text-texto-suave">{descripcion}</p>
          {children}
        </section>
      </main>
    </div>
  )
}
