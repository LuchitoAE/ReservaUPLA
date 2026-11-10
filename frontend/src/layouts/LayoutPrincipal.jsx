import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import logoUpla from '../assets/logo-upla-blanco.png'
import { BarraSuperior } from '../components/navegacion/BarraSuperior'
import { MenuDeUsuario } from '../components/navegacion/MenuDeUsuario'
import { MenuPrincipal } from '../components/navegacion/MenuPrincipal'
import { BotonTema } from '../components/ui/BotonTema'
import { Cargando } from '../components/ui/Cargando'
import { Icono } from '../components/ui/Icono'
import { useUsuarioActual } from '../hooks/useUsuarioActual'

// Estructura común de las páginas del sistema: marca UPLA y menú a la izquierda, la barra superior con la ruta, el
// modo y la sesión (diseño AD01), la página actual en el centro (<Outlet />) y el pie. Sin sesión no se entra: se va a
// la pantalla de ingreso y, al volver, se regresa a la página que se pidió.
// En pantallas grandes el menú se puede contraer a solo íconos («Contraer menú», al pie de la barra lateral): quien ya
// conoce el sistema gana ancho de lectura sin perder las secciones.
export function LayoutPrincipal() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [contraido, setContraido] = useState(false)
  const { pathname, search } = useLocation()
  const paginaAnterior = useRef(pathname)
  const { usuarioActual, cargando, motivoSinSesion } = useUsuarioActual()

  // Al cambiar de página, el foco va al título de la nueva: quien usa teclado o lector de pantalla sabe que el
  // contenido cambió aunque el documento no se haya recargado.
  useEffect(() => {
    if (paginaAnterior.current !== pathname) {
      paginaAnterior.current = pathname
      document.getElementById('titulo-pagina')?.focus()
    }
  }, [pathname])

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Cargando texto="Verificando la sesión…" />
      </div>
    )
  }

  // Al cerrar la sesión no se recuerda la página: al volver a entrar se empieza por el panel principal.
  if (!usuarioActual) {
    const estado =
      motivoSinSesion === 'salida'
        ? { aviso: 'Cerró su sesión.' }
        : { desde: pathname + search, aviso: motivoSinSesion === 'terminada' ? 'Su sesión terminó. Vuelva a ingresar para continuar.' : null }
    return <Navigate to="/ingreso" replace state={estado} />
  }

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className={`min-h-screen lg:grid ${contraido ? 'lg:grid-cols-[6rem_minmax(0,1fr)]' : 'lg:grid-cols-[17rem_minmax(0,1fr)]'}`}>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold focus:text-titulo focus:outline-3 focus:outline-foco"
      >
        Saltar al contenido
      </a>

      <div className="bg-marca-900 text-white">
        <header className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
          <div className={`flex items-center gap-3 px-4 py-4 lg:flex-col lg:items-stretch lg:gap-5 lg:py-6 ${contraido ? 'lg:px-2' : 'lg:px-4'}`}>
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-expanded={menuAbierto}
              aria-controls="menu-principal"
              aria-label={menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/40 transition hover:bg-white/10 active:bg-white/20 focus-visible:outline-3 focus-visible:outline-acento lg:hidden"
            >
              <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} />
            </button>

            <Link
              to="/"
              onClick={cerrarMenu}
              className={`flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-acento lg:flex-col lg:gap-3 ${contraido ? 'lg:items-center' : 'lg:items-start'}`}
            >
              <img
                src={logoUpla}
                alt="Universidad Peruana Los Andes"
                className={`h-8 w-auto shrink-0 ${contraido ? 'lg:h-auto lg:w-full' : 'lg:h-9'}`}
              />
              <span className={`hidden min-w-0 sm:block ${contraido ? 'lg:hidden' : ''}`}>
                <span className="block truncate text-base font-bold lg:text-xl">ReservaUPLA</span>
                <span className="hidden text-sm text-marca-100 lg:block">Reservas de ambientes</span>
              </span>
            </Link>

            <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
              <BotonTema sobreFondoOscuro />
              <MenuDeUsuario />
            </div>
          </div>

          <MenuPrincipal id="menu-principal" abierto={menuAbierto} alElegir={cerrarMenu} contraido={contraido} />

          <button
            type="button"
            onClick={() => setContraido(!contraido)}
            aria-label={contraido ? 'Expandir el menú' : 'Contraer el menú'}
            title={contraido ? 'Expandir el menú' : 'Contraer el menú'}
            className={`mt-auto hidden min-h-11 items-center gap-3 border-t border-white/15 px-4 py-4 text-left font-semibold transition hover:bg-white/10 active:bg-white/20 focus-visible:outline-3 focus-visible:outline-acento lg:flex ${contraido ? 'justify-center' : ''}`}
          >
            <Icono nombre="anterior" className={`size-5 shrink-0 transition ${contraido ? 'rotate-180' : ''}`} />
            <span className={contraido ? 'sr-only' : ''}>Contraer menú</span>
          </button>
        </header>
      </div>

      <div className="flex min-h-screen min-w-0 flex-col">
        <BarraSuperior />
        <main id="contenido" tabIndex={-1} className="flex-1 px-4 py-8 pb-24 focus:outline-none sm:px-7 lg:pb-8">
          <Outlet />
        </main>
        <footer className="border-t border-borde px-4 py-4 text-center text-sm text-texto-suave sm:px-7">
          ReservaUPLA · Universidad Peruana Los Andes · Gestión de reservas de ambientes
        </footer>
      </div>

      {/* En el teléfono, la acción principal del sistema (diseño T2): un botón flotante que sigue a la vista al
          desplazar, en lugar del botón de la barra lateral, que ahí queda dentro del menú. */}
      {pathname !== '/reservas/nueva' && (
        <Link
          to="/reservas/nueva"
          className="fixed right-4 bottom-4 z-30 inline-flex min-h-14 items-center gap-2 rounded-full bg-acento px-5 font-semibold text-acento-texto shadow-lg transition hover:brightness-95 active:translate-y-px focus-visible:outline-3 focus-visible:outline-foco lg:hidden"
        >
          <Icono nombre="nueva" />
          Nueva reserva
        </Link>
      )}
    </div>
  )
}
