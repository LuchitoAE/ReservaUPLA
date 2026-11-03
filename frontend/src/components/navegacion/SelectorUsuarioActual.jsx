import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { QUE_HACE_EL_ROL, ROLES } from '../../utils/formato'

// «Usuario actual» en la barra lateral: simula la sesión, que el caso no pide. Debajo dice el rol y qué permite
// (visibilidad, Norman: el usuario sabe qué puede hacer sin probar). Al cambiarlo, el texto se anuncia (feedback
// inmediato). La interfaz muestra a cada rol solo sus acciones; la regla la vuelve a comprobar la API.
export function SelectorUsuarioActual() {
  const { usuarios, cargando, usuarioActual, elegir } = useUsuarioActual()

  return (
    <div className="mx-3 mb-3 rounded-lg bg-white/10 p-3 lg:mx-4">
      <label htmlFor="usuario-actual" className="block text-sm font-semibold text-marca-100">
        Usuario actual
      </label>
      <select
        id="usuario-actual"
        value={usuarioActual?.id_usuario ?? ''}
        onChange={(evento) => elegir(evento.target.value)}
        disabled={cargando || usuarios.length === 0}
        aria-describedby="usuario-actual-rol"
        className="mt-1 min-h-11 w-full cursor-pointer rounded-lg border border-white/40 bg-marca-800 px-2 text-white hover:border-white focus-visible:outline-3 focus-visible:outline-white"
      >
        <option value="" disabled>
          {cargando ? 'Cargando usuarios…' : usuarios.length === 0 ? 'No hay usuarios activos' : 'Elija un usuario'}
        </option>
        {usuarios.map((usuario) => (
          <option key={usuario.id_usuario} value={usuario.id_usuario}>
            {usuario.nombre_completo_usuario}
          </option>
        ))}
      </select>
      <p id="usuario-actual-rol" aria-live="polite" className="mt-1.5 text-sm text-marca-100">
        {usuarioActual ? (
          <>
            <strong className="text-white">{ROLES[usuarioActual.rol_usuario]}</strong>
            <span className="block">{QUE_HACE_EL_ROL[usuarioActual.rol_usuario]}</span>
          </>
        ) : (
          'Elija quién usa el sistema para ver sus acciones.'
        )}
      </p>
    </div>
  )
}
