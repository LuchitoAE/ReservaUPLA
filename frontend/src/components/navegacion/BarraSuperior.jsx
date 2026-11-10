import { Link, useLocation } from 'react-router'
import { useMigaDePagina } from '../../contexto/contextoMiga'
import { migasDeRuta } from './migas'
import { MenuDeUsuario } from './MenuDeUsuario'
import { BotonTema } from '../ui/BotonTema'

// Barra superior de las páginas del sistema (diseños AC01, AD01, S01, R01, S04 y S15): dónde está, el modo claro u
// oscuro y la sesión. Va pegada arriba al desplazar, así que la ruta y la salida siguen a la vista en páginas largas.
// En el teléfono no se muestra: la marca y el menú ocupan la cabecera y la ruta sobra (diseño T2).
export function BarraSuperior() {
  const { pathname } = useLocation()
  const { codigoDeReserva } = useMigaDePagina() ?? {}
  const migas = migasDeRuta(pathname, codigoDeReserva)
  const actual = migas[migas.length - 1]

  return (
    <header className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-borde bg-superficie px-7 py-3 lg:flex">
      <nav aria-label="Ruta de navegación" className="min-w-0 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          {migas.slice(0, -1).map((miga) => (
            <li key={miga.ruta} className="flex items-center gap-1.5">
              <Link to={miga.ruta} className="text-enlace underline underline-offset-2 hover:decoration-2">
                {miga.nombre}
              </Link>
              <span aria-hidden="true" className="text-texto-suave">
                ›
              </span>
            </li>
          ))}
          <li aria-current="page" className="font-semibold text-texto">
            {actual.nombre}
          </li>
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <BotonTema />
        <MenuDeUsuario />
      </div>
    </header>
  )
}
