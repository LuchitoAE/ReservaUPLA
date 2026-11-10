import { Link } from 'react-router'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { QUE_HACE_EL_ROL, ROLES } from '../../utils/formato'

// Quién inició sesión, su rol y qué puede hacer (visibilidad, Norman: lo sabe sin probar), y la salida siempre a la
// vista (control del usuario, Shneiderman). Al cerrar la sesión, el layout lleva a la pantalla de ingreso con el aviso.
// «Mi cuenta» lleva a sus datos, al cambio de contraseña y a las preferencias (RF-11, RF-14).
export function PanelDeSesion() {
  const { usuarioActual, cerrarSesion } = useUsuarioActual()

  return (
    <div className="mx-3 mb-3 rounded-lg border-l-4 border-acento bg-white/10 p-3 lg:mx-4">
      <p className="text-xs font-semibold tracking-wide text-marca-100 uppercase">Sesión iniciada</p>
      <p className="mt-0.5 font-semibold break-words text-white">{usuarioActual.nombre_completo_usuario}</p>
      <p className="text-sm text-marca-100">
        <strong className="text-white">{ROLES[usuarioActual.rol_usuario]}</strong> · {QUE_HACE_EL_ROL[usuarioActual.rol_usuario]}
      </p>
      <Link
        to="/mi-cuenta"
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-white/15 px-3 font-semibold text-white transition hover:bg-white/25 active:translate-y-px focus-visible:outline-3 focus-visible:outline-acento"
      >
        Mi cuenta
      </Link>
      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/50 px-3 font-semibold text-white transition hover:bg-white/10 active:translate-y-px active:bg-white/20 focus-visible:outline-3 focus-visible:outline-acento"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
