import { Link, matchPath, useLocation } from 'react-router'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { SECCIONES } from '../../navegacion'
import { Icono } from '../ui/Icono'

const ESTILO_OPCION = 'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2'

// Menú de la SPA. La sección actual se resalta y se anuncia (aria-current="page"), también en sus subpáginas:
// en el detalle de una reserva sigue marcada «Reservas». Las secciones que aún no existen se ven sin enlace.
// En el teléfono el menú se abre y se cierra con el botón «Menú»; en pantallas grandes siempre está visible.
// Cada rol ve solo las secciones que puede usar (restricción, Norman): no hay enlaces que terminen en «no permitido».
export function MenuPrincipal({ id, abierto, alElegir }) {
  const { pathname } = useLocation()
  const { usuarioActual } = useUsuarioActual()
  const visibles = SECCIONES.filter((seccion) => !seccion.roles || seccion.roles.includes(usuarioActual?.rol_usuario))

  const estaActiva = (seccion) =>
    seccion.activaEn.some((patron) => matchPath(patron, pathname)) &&
    !(seccion.excepto ?? []).some((patron) => matchPath(patron, pathname))

  return (
    <nav
      id={id}
      aria-label="Menú principal"
      className={`${abierto ? 'block' : 'hidden'} border-t border-white/15 px-3 py-3 lg:block lg:border-0 lg:px-4`}
    >
      <ul className="flex flex-col gap-1">
        {visibles.map((seccion) => {
          const activa = estaActiva(seccion)
          return (
            <li key={seccion.nombre}>
              {seccion.ruta ? (
                <Link
                  to={seccion.ruta}
                  onClick={alElegir}
                  aria-current={activa ? 'page' : undefined}
                  className={`${ESTILO_OPCION} font-semibold focus-visible:outline-3 focus-visible:outline-acento ${
                    activa ? 'bg-white text-marca-900 shadow-[inset_4px_0_0_var(--color-acento)]' : 'text-white hover:bg-white/10 active:bg-white/20'
                  }`}
                >
                  <Icono nombre={seccion.icono} />
                  {seccion.nombre}
                </Link>
              ) : (
                <span className={`${ESTILO_OPCION} text-marca-100`}>
                  <Icono nombre={seccion.icono} />
                  <span className="flex flex-col">
                    {seccion.nombre}
                    <span className="text-xs">Próximamente</span>
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
