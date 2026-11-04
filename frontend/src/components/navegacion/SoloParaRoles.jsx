import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { Button } from '../ui/Button'
import { EncabezadoDePagina } from './EncabezadoDePagina'

// Páginas que solo ve un rol (registrar usuarios o ambientes: el administrador). El menú ya no las muestra a los
// demás; si alguien llega por la dirección, ve por qué no puede entrar y una salida (no una página en blanco).
export function SoloParaRoles({ roles, children }) {
  const { usuarioActual } = useUsuarioActual()

  if (roles.includes(usuarioActual.rol_usuario)) {
    return children
  }

  return (
    <>
      <EncabezadoDePagina titulo="Acceso restringido" descripcion="Esta sección es solo para el administrador del sistema." />
      <div className="flex flex-col items-start gap-4 rounded-xl border border-borde bg-superficie p-6">
        <p>Si necesita registrar usuarios o ambientes, pídaselo al administrador.</p>
        <Button destino="/" variante="principal">
          Ir al dashboard
        </Button>
      </div>
    </>
  )
}
