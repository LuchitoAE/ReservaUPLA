// Indicador de carga (feedback informativo, Shneiderman): mientras llegan los datos, el usuario ve que el sistema
// está trabajando y qué está trayendo. Se anuncia a los lectores de pantalla (role="status"). «sinMarco» lo deja
// suelto sobre el fondo, para la pantalla completa que verifica la sesión (diseño C07).
export function Cargando({ texto, className = '', sinMarco = false }) {
  return (
    <p
      role="status"
      className={`flex items-center gap-3 text-texto-suave ${sinMarco ? '' : 'rounded-xl border border-borde bg-superficie p-6 shadow-tarjeta'} ${className}`}
    >
      <span className="size-5 animate-spin rounded-full border-2 border-foco border-r-transparent" aria-hidden="true" />
      {texto}
    </p>
  )
}
