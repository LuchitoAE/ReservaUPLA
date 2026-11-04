import logoUpla from '../../assets/logo-upla-blanco.png'
import portada from '../../assets/portada-upla.jpg'
import { BotonTema } from '../ui/BotonTema'

// Estructura de las pantallas de acceso (ingreso y creación de cuenta): la marca UPLA con la imagen del campus a un
// lado y el formulario en una tarjeta al otro. En el teléfono la imagen queda arriba, como franja.
// Imagen de fondo y logo: recursos institucionales de la UPLA (intranet y página de marca), solo para este prototipo
// académico.
export function MarcoDeAcceso({ titulo, descripcion, tituloPestana, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,1fr)]">
      <title>{`${tituloPestana} · ReservaUPLA`}</title>
      <aside className="relative min-h-56 overflow-hidden bg-marca-900 text-white lg:min-h-screen">
        <img src={portada} alt="" className="absolute inset-0 size-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-marca-900 via-marca-900/85 to-marca-900/35" />
        <div className="relative flex h-full flex-col justify-between gap-8 p-6 lg:p-12">
          <img src={logoUpla} alt="Universidad Peruana Los Andes" className="h-11 w-auto self-start" />
          <div>
            <p className="text-sm font-semibold tracking-wider text-acento uppercase">Reservas de ambientes</p>
            <p className="text-4xl font-bold lg:text-5xl">ReservaUPLA</p>
            <p className="mt-3 max-w-md text-marca-100">Laboratorios, auditorios y salas de la universidad, en un solo lugar.</p>
          </div>
        </div>
      </aside>
      <main className="relative flex items-center justify-center bg-fondo px-4 py-10 sm:px-8">
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
