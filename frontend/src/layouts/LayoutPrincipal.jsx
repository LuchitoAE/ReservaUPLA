import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { MenuPrincipal } from '../components/navegacion/MenuPrincipal'
import { Icono } from '../components/ui/Icono'

// Estructura común de todas las páginas: marca y menú a la izquierda (arriba en el teléfono), la página actual
// en el centro (<Outlet />) y el pie. Las páginas solo traen su propio contenido.
export function LayoutPrincipal() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const paginaAnterior = useRef(pathname)

  // Al cambiar de página, el foco va al título de la nueva: quien usa teclado o lector de pantalla sabe que el
  // contenido cambió aunque el documento no se haya recargado.
  useEffect(() => {
    if (paginaAnterior.current !== pathname) {
      paginaAnterior.current = pathname
      document.getElementById('titulo-pagina')?.focus()
    }
  }, [pathname])

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold focus:text-titulo focus:outline-3 focus:outline-foco"
      >
        Saltar al contenido
      </a>

      {/* La columna lleva el fondo hasta el final de la página; el encabezado queda fijo mientras se baja. */}
      <div className="bg-marca-900 text-white">
        <header className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6 lg:py-6">
            <Link
              to="/"
              onClick={cerrarMenu}
              className="rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="block text-xl font-bold">ReservaUPLA</span>
              <span className="block text-sm text-marca-100">Reservas de ambientes</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-expanded={menuAbierto}
              aria-controls="menu-principal"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/40 px-3 font-semibold hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-white lg:hidden"
            >
              <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} />
              Menú
            </button>
          </div>
          <MenuPrincipal id="menu-principal" abierto={menuAbierto} alElegir={cerrarMenu} />
        </header>
      </div>

      <div className="flex min-h-screen min-w-0 flex-col">
        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-none sm:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-borde px-4 py-4 text-center text-sm text-texto-suave sm:px-8">
          ReservaUPLA · Universidad Peruana Los Andes · Gestión de reservas de ambientes
        </footer>
      </div>

      <ScrollRestoration />
    </div>
  )
}
