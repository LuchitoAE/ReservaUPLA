import fotoLogin from '../../assets/campus/campus-login.webp'
import logoReserva from '../../assets/logo-reserva-upla-blanco.png'

// Pantalla de ingreso a pantalla completa (decisión del alumno del 10/11/2026): una sola foto del campus cubre todo el
// fondo y se ve nítida; el formulario va a la derecha en un vidrio claro, siempre en modo claro. El desenfoque es local:
// un halo suave detrás de la marca (logo y frase) y otro alrededor del formulario, para que el texto se lea sin apagar
// la foto. El logo ya incluye el nombre: no se repite como texto. La foto es institucional y solo se usa en este
// prototipo académico.
export function MarcoDeAcceso({ titulo, descripcion, tituloPestana, saliendo = false, children }) {
  return (
    <div
      className={`login-claro animar-pagina relative isolate min-h-screen overflow-hidden transition-opacity duration-150 motion-reduce:transition-none ${saliendo ? 'opacity-0' : 'opacity-100'}`}
    >
      <title>{`${tituloPestana} · ReservaUPLA`}</title>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${fotoLogin})` }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-noche/90 via-noche/55 to-noche/15" />

      <div className="relative flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="animar-login relative pt-1">
          <div className="relative inline-block">
            <div
              aria-hidden="true"
              className="halo-de-ingreso absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2.5rem]"
            />
            <img
              src={logoReserva}
              alt="ReservaUPLA"
              className="h-11 w-auto drop-shadow-lg sm:h-20 lg:h-24"
            />
            <p className="mt-4 max-w-md text-lg font-medium text-marca-100 sm:text-xl">
              Reserva laboratorios, auditorios y salas de la UPLA en un solo lugar.
            </p>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 lg:justify-end lg:pr-16">
          <div className="relative w-full max-w-lg">
            <div
              aria-hidden="true"
              className="halo-de-ingreso absolute -inset-20 -z-10 rounded-[2.5rem]"
            />
            <section className="animar-formulario relative w-full rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold text-titulo focus:outline-none">
                {titulo}
              </h1>
              <p className="mt-1 mb-6 text-texto-suave">{descripcion}</p>
              {children}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
