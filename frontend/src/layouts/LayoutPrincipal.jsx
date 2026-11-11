import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import fuego from '../assets/fuego1.png'
import { BandaDeSeccion } from '../components/navegacion/BandaDeSeccion'
import { bandaDeRuta } from '../components/navegacion/bandaDeRuta'
import { BarraSuperior } from '../components/navegacion/BarraSuperior'
import { Cargando } from '../components/ui/Cargando'
import { ContextoBanda } from '../contexto/contextoBanda'
import { ContextoMiga } from '../contexto/contextoMiga'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { AccionFlotante } from './AccionFlotante'
import { BarraLateral } from './BarraLateral'

// Estructura común de las páginas del sistema: marca UPLA y menú a la izquierda, la barra superior con la ruta, el
// modo y la sesión (diseño AD01), la página actual en el centro (<Outlet />) y el pie. Sin sesión no se entra: se va a
// la pantalla de ingreso y, al volver, se regresa a la página que se pidió.
export function LayoutPrincipal() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [contraido, setContraido] = useState(false)
  const [codigoDeReserva, setCodigoDeReserva] = useState(null)
  const [bandaDeLaPagina, setBandaDeLaPagina] = useState(null)
  const { pathname, search } = useLocation()
  const paginaAnterior = useRef(pathname)
  const { usuarioActual, cargando, motivoSinSesion, transicionando } = useUsuarioActual()

  // Al cambiar de página, el foco va al título de la nueva: quien usa teclado o lector de pantalla sabe que el
  // contenido cambió aunque el documento no se haya recargado.
  useEffect(() => {
    if (paginaAnterior.current !== pathname) {
      paginaAnterior.current = pathname
      document.getElementById('titulo-pagina')?.focus()
    }
  }, [pathname])

  // La banda azul se queda quieta: la ruta da sus datos y la página solo sobrescribe lo que sabe mejor (el saludo, el
  // código de la reserva). Al cambiar de dirección, lo que dejó la página anterior ya no se usa.
  const fijarBanda = useCallback((datos) => setBandaDeLaPagina({ pathname, datos }), [pathname])

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Cargando texto="Verificando la sesión…" sinMarco />
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

  const datosDeLaRuta = bandaDeRuta(pathname, usuarioActual)
  const datosDeLaPagina = bandaDeLaPagina?.pathname === pathname ? bandaDeLaPagina.datos : null
  const banda = { ...datosDeLaRuta, ...datosDeLaPagina }

  return (
    <ContextoBanda value={{ fijarBanda }}>
      <ContextoMiga value={{ codigoDeReserva, fijarMiga: setCodigoDeReserva }}>
        <div
          className={`min-h-screen transition-[opacity,grid-template-columns] duration-200 ease-out motion-reduce:transition-none lg:grid ${transicionando ? 'opacity-0' : 'opacity-100'} ${contraido ? 'lg:grid-cols-[6rem_minmax(0,1fr)]' : 'lg:grid-cols-[17rem_minmax(0,1fr)]'}`}
        >
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold focus:text-titulo focus:outline-3 focus:outline-foco"
          >
            Saltar al contenido
          </a>

          <BarraLateral
            menuAbierto={menuAbierto}
            contraido={contraido}
            alAlternarMenu={() => setMenuAbierto(!menuAbierto)}
            alCerrarMenu={cerrarMenu}
            alAlternarContraido={() => setContraido(!contraido)}
          />

          <div className="flex min-h-screen min-w-0 flex-col">
            <BarraSuperior />
            <main id="contenido" tabIndex={-1} className="relative isolate flex-1 overflow-hidden px-4 py-8 pb-24 focus:outline-none sm:px-7 lg:pb-8">
              {/* Fondo de todas las secciones: la llama de la UPLA grande, corrida a la izquierda y muy transparente
                  para que se mezcle con el fondo. Es decorativa: no dice nada que el texto no diga. */}
              <img
                src={fuego}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -left-24 -z-10 h-[130%] w-auto max-w-none -translate-y-1/2 opacity-[0.08] select-none"
              />
              <BandaDeSeccion {...banda} accionEnTelefono={pathname !== '/reservas'} />
              <div key={pathname} className="animar-pagina">
                <Outlet />
              </div>
            </main>
            <footer className="border-t border-borde px-4 py-4 text-center text-sm text-texto-suave sm:px-7">
              ReservaUPLA · Universidad Peruana Los Andes · Gestión de reservas de ambientes
            </footer>
          </div>

          {pathname !== '/reservas/nueva' && <AccionFlotante />}
        </div>
      </ContextoMiga>
    </ContextoBanda>
  )
}
