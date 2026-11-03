import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { ROLES } from '../../utils/formato'

// «Usuario actual» en la barra lateral: simula la sesión, que el caso no pide. La interfaz muestra a cada rol
// solo las acciones que le corresponden; la regla la vuelve a comprobar la API.
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
        className="mt-1 min-h-11 w-full rounded-lg border border-white/40 bg-marca-800 px-2 text-white focus-visible:outline-3 focus-visible:outline-white"
      >
        <option value="" disabled>
          {usuarios.length === 0 ? 'No hay usuarios activos' : 'Elija un usuario'}
        </option>
        {usuarios.map((usuario) => (
          <option key={usuario.id_usuario} value={usuario.id_usuario}>
            {usuario.nombre_completo_usuario}
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-marca-100">{usuarioActual ? ROLES[usuarioActual.rol_usuario] : 'Sin elegir'}</p>
    </div>
  )
}
