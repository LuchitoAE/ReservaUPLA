import { Link } from 'react-router'
import logoReserva from '../assets/logo-reserva-upla-blanco.png'
import { MenuDeUsuario } from '../components/navegacion/MenuDeUsuario'
import { MenuPrincipal } from '../components/navegacion/MenuPrincipal'
import { BotonTema } from '../components/ui/BotonTema'
import { Icono } from '../components/ui/Icono'

// Barra lateral de todas las páginas (diseño AD01): marca UPLA, menú, tema y sesión. En pantallas grandes se puede
// contraer a solo íconos («Contraer menú», al pie): quien ya conoce el sistema gana ancho de lectura.
export function BarraLateral({ menuAbierto, contraido, alAlternarMenu, alCerrarMenu, alAlternarContraido }) {
  return (
    <div className="overflow-hidden bg-lateral text-white">
      <header className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className={`flex items-center gap-3 px-4 py-4 lg:flex-col lg:items-stretch lg:gap-5 lg:py-6 ${contraido ? 'lg:px-2' : 'lg:px-4'}`}>
          <button
            type="button"
            onClick={alAlternarMenu}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            aria-label={menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/40 transition hover:bg-white/10 active:bg-white/20 focus-visible:outline-3 focus-visible:outline-acento lg:hidden"
          >
            <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} />
          </button>

          <Link
            to="/"
            onClick={alCerrarMenu}
            aria-label="ReservaUPLA"
            className={`flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-acento lg:flex-col lg:gap-3 ${contraido ? 'lg:items-center' : 'lg:items-start'}`}
          >
            {/* El logo ya trae el nombre; el texto suelto «ReservaUPLA» ya no se repite. */}
            <img
              src={logoReserva}
              alt=""
              className={`h-8 w-auto shrink-0 transition-opacity duration-200 motion-reduce:transition-none ${contraido ? 'lg:hidden' : 'lg:h-9'}`}
            />
            <span className={`hidden overflow-hidden ${contraido ? 'lg:flex lg:size-11 lg:items-center' : ''}`}>
              <img src={logoReserva} alt="" className="h-11 w-auto max-w-none" />
            </span>
            <span className={`hidden min-w-0 transition-[max-height,opacity] duration-150 motion-reduce:transition-none sm:block ${contraido ? 'lg:hidden' : ''}`}>
              <span className="hidden text-sm text-marca-100 lg:block">Reservas de ambientes</span>
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
            <BotonTema sobreFondoOscuro />
            <MenuDeUsuario />
          </div>
        </div>

        <MenuPrincipal id="menu-principal" abierto={menuAbierto} alElegir={alCerrarMenu} contraido={contraido} />

        <button
          type="button"
          onClick={alAlternarContraido}
          aria-label={contraido ? 'Expandir el menú' : 'Contraer el menú'}
          title={contraido ? 'Expandir el menú' : 'Contraer el menú'}
          className={`mt-auto hidden min-h-11 items-center gap-3 border-t border-white/15 px-4 py-4 text-left font-semibold transition hover:bg-white/10 active:bg-white/20 focus-visible:outline-3 focus-visible:outline-acento lg:flex ${contraido ? 'justify-center' : ''}`}
        >
          <Icono nombre="anterior" className={`size-5 shrink-0 transition ${contraido ? 'rotate-180' : ''}`} />
          <span className={`whitespace-nowrap transition-[max-width,opacity] duration-150 motion-reduce:transition-none ${contraido ? 'lg:max-w-0 lg:overflow-hidden lg:opacity-0' : 'lg:max-w-52 lg:opacity-100'}`}>Contraer menú</span>
        </button>
      </header>
    </div>
  )
}
