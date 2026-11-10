import { Link, matchPath, useLocation } from 'react-router'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { SECCIONES } from '../../navegacion'
import { Icono } from '../ui/Icono'

const ESTILO_OPCION = 'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2'

// Menú de la SPA. Arriba va el botón dorado «+ Nueva reserva» (diseño AD01): la acción más frecuente está siempre a
// la vista y no se busca dentro de la lista. La sección actual se resalta y se anuncia (aria-current="page"), también
// en sus subpáginas: en el detalle de una reserva sigue marcada «Reservas». Cada rol ve solo lo que puede usar
// (restricción, Norman). El grupo «Administración» solo aparece para el administrador; para los demás, Ambientes es
// una sección más. En el teléfono el menú se abre y se cierra con el botón «Menú»; en pantallas grandes siempre está
// visible y se puede contraer a solo íconos.
export function MenuPrincipal({ id, abierto, alElegir, contraido = false }) {
  const { pathname } = useLocation()
  const { usuarioActual } = useUsuarioActual()
  const visibles = SECCIONES.filter(
    (seccion) => seccion.enMenu !== false && (!seccion.roles || seccion.roles.includes(usuarioActual?.rol_usuario)),
  )
  const conGrupo = usuarioActual?.rol_usuario === 'Administrador'

  const estaActiva = (seccion) =>
    seccion.activaEn.some((patron) => matchPath(patron, pathname)) &&
    !(seccion.excepto ?? []).some((patron) => matchPath(patron, pathname))

  // Se recorren las secciones visibles y se intercala el título del grupo cuando cambia, para no repetirlo.
  const filas = []
  let grupoAnterior
  for (const seccion of visibles) {
    const grupo = conGrupo ? seccion.grupo : undefined
    if (grupo && grupo !== grupoAnterior) {
      filas.push({ tipo: 'grupo', clave: `grupo-${grupo}`, nombre: grupo })
    }
    grupoAnterior = grupo
    filas.push({ tipo: 'seccion', clave: seccion.nombre, seccion })
  }

  const soloIcono = contraido ? 'lg:justify-center' : ''
  const textoContraido = contraido
    ? 'lg:max-w-0 lg:overflow-hidden lg:opacity-0'
    : 'lg:max-w-52 lg:opacity-100'
  const transicionTexto = 'whitespace-nowrap transition-[max-width,opacity] duration-150 motion-reduce:transition-none'

  return (
    <nav
      id={id}
      aria-label="Menú principal"
      className={`${abierto ? 'block' : 'hidden'} border-t border-white/15 px-3 py-3 lg:block lg:border-0 ${contraido ? 'lg:px-2' : 'lg:px-4'}`}
    >
      <Link
        to="/reservas/nueva"
        onClick={alElegir}
        title="Nueva reserva"
        className={`mb-3 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-acento px-3 font-semibold text-acento-texto transition hover:brightness-95 active:translate-y-px focus-visible:outline-3 focus-visible:outline-white ${soloIcono}`}
      >
        <Icono nombre="nueva" />
        <span className={`${transicionTexto} ${textoContraido}`}>Nueva reserva</span>
      </Link>

      <ul className="flex flex-col gap-1">
        {filas.map((fila) => {
          if (fila.tipo === 'grupo') {
            return (
              <li
                key={fila.clave}
                className={`overflow-hidden px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-marca-100 uppercase transition-[max-height,opacity,padding] duration-150 motion-reduce:transition-none ${contraido ? 'lg:max-h-0 lg:py-0 lg:opacity-0' : 'lg:max-h-10 lg:opacity-100'}`}
              >
                {fila.nombre}
              </li>
            )
          }

          const { seccion } = fila
          const activa = estaActiva(seccion)
          return (
            <li key={fila.clave}>
              {seccion.ruta ? (
                <Link
                  to={seccion.ruta}
                  onClick={alElegir}
                  aria-current={activa ? 'page' : undefined}
                  aria-label={seccion.nombre}
                  title={seccion.nombre}
                  className={`${ESTILO_OPCION} ${soloIcono} font-semibold focus-visible:outline-3 focus-visible:outline-acento ${
                    activa ? 'bg-lateral-activo text-lateral-activo-texto shadow-[inset_4px_0_0_var(--color-acento)]' : 'text-white hover:bg-white/10 active:bg-white/20'
                  }`}
                >
                  <Icono nombre={seccion.icono} />
                  <span className={`${transicionTexto} ${textoContraido}`}>{seccion.nombre}</span>
                </Link>
              ) : (
                <span className={`${ESTILO_OPCION} ${soloIcono} text-marca-100`}>
                  <Icono nombre={seccion.icono} />
                  <span className={`flex flex-col ${transicionTexto} ${textoContraido}`}>
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
