// Aviso general (componente «AlertMessage» del caso): éxito, error, advertencia, información o cancelado (gris), con
// el semáforo de estados (RNF-05): verde, rojo, ámbar, azul y gris. El color nunca va solo: lleva ícono y texto.
// El de error se anuncia de inmediato (role="alert"); los demás, cuando el lector de pantalla termina lo que está
// leyendo (role="status"). Con anunciar={false} no se anuncia: para el mensaje fijo de una tarjeta, que describe un
// estado y no el resultado de una acción (ese va en un aviso flotante). «aviso» acepta lo que arma avisoDeError():
// { titulo, mensaje }. Nunca muestra códigos internos (Shneiderman: manejo simple de errores).
const ESTILOS = {
  exito: 'border-exito bg-exito-fondo text-exito-texto',
  error: 'border-error bg-error-fondo text-error-texto',
  aviso: 'border-aviso bg-aviso-fondo text-aviso-texto',
  info: 'border-info bg-info-fondo text-info-texto',
  cancelada: 'border-cancelada-texto bg-cancelada-fondo text-cancelada-texto',
}

const ICONOS = { exito: '✓', error: '⚠', aviso: '!', info: 'i', cancelada: '⊘' }

export function AlertMessage({ tipo = 'info', titulo, aviso, anunciar = true, children, className = '' }) {
  const encabezado = titulo ?? aviso?.titulo
  const contenido = children ?? aviso?.mensaje
  const rol = anunciar ? (tipo === 'error' ? 'alert' : 'status') : undefined

  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${ESTILOS[tipo]} ${className}`} role={rol}>
      <span className="w-4 text-center text-lg leading-6 font-bold" aria-hidden="true">
        {ICONOS[tipo]}
      </span>
      <div className="min-w-0">
        {encabezado && <p className="font-semibold">{encabezado}</p>}
        {contenido && <div>{contenido}</div>}
      </div>
    </div>
  )
}
