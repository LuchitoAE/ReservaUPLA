import fotoLogin from '../../assets/campus/campus-login.webp'
import logoReserva from '../../assets/logo-reserva-upla-blanco.png'
import { BotonTema } from '../ui/BotonTema'

// Pantalla de ingreso a pantalla completa (decisión del alumno del 10/11/2026): una sola foto del campus cubre todo el
// fondo, con un degradado para leer el logo y la frase; el formulario va a la derecha en un vidrio oscuro. Alrededor
// del formulario el fondo se desenfoca (spotlight) para que la mirada vaya al ingreso. El logo ya incluye el nombre:
// no se repite como texto. La foto es institucional y solo se usa en este prototipo académico.
export function MarcoDeAcceso({ titulo, descripcion, tituloPestana, saliendo = false, children }) {
  return (
    <div
      className={`login-oscuro animar-pagina relative isolate min-h-screen overflow-hidden transition-opacity duration-150 motion-reduce:transition-none ${saliendo ? 'opacity-0' : 'opacity-100'}`}
    >
      <title>{`${tituloPestana} · ReservaUPLA`}</title>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${fotoLogin})` }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-noche/90 via-noche/55 to-noche/15" />
      <div aria-hidden="true" className="desenfoque-foco absolute inset-0 -z-10" />

      <div className="relative flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
        <BotonTema sobreFondoOscuro className="absolute top-5 right-5 z-20" />

        <header className="animar-login max-w-xl pt-1">
          <img
            src={logoReserva}
            alt="ReservaUPLA"
            className="h-10 w-auto drop-shadow-lg sm:h-16 lg:h-20"
          />
          <p className="mt-4 max-w-md text-base font-medium text-marca-100 sm:text-lg">
            Reserva laboratorios, auditorios y salas de la UPLA en un solo lugar.
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 lg:justify-end">
          <section className="animar-formulario w-full max-w-md rounded-3xl border border-white/15 bg-noche/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold text-white focus:outline-none">
              {titulo}
            </h1>
            <p className="mt-1 mb-6 text-marca-100">{descripcion}</p>
            {children}
          </section>
        </main>
      </div>
    </div>
  )
}
