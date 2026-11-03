// Aviso general (componente «AlertMessage» del caso): éxito, error, advertencia o información.
// El de error se anuncia de inmediato (role="alert"); los demás, cuando el lector de pantalla termina lo que está
// leyendo (role="status"). El color nunca va solo: lleva ícono y texto.
// «aviso» acepta directamente lo que arma avisoDeError(): { titulo, mensaje, codigoRastreo }. El código de rastreo
// solo llega en errores del servidor, para que soporte encuentre el detalle en su registro.
const ESTILOS = {
  exito: 'border-exito bg-exito-fondo text-exito-texto',
  error: 'border-error bg-error-fondo text-error-texto',
  aviso: 'border-aviso bg-aviso-fondo text-aviso-texto',
  info: 'border-info bg-info-fondo text-info-texto',
}

const ICONOS = { exito: '✓', error: '⚠', aviso: '!', info: 'i' }

export function AlertMessage({ tipo = 'info', titulo, aviso, children, className = '' }) {
  const encabezado = titulo ?? aviso?.titulo
  const contenido = children ?? aviso?.mensaje

  return (
    <div
      className={`flex gap-3 rounded-lg border-l-4 p-4 ${ESTILOS[tipo]} ${className}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      <span className="w-4 text-center text-lg leading-6 font-bold" aria-hidden="true">
        {ICONOS[tipo]}
      </span>
      <div className="min-w-0">
        {encabezado && <p className="font-semibold">{encabezado}</p>}
        {contenido && <div>{contenido}</div>}
        {aviso?.codigoRastreo && (
          <p className="mt-1 text-sm">
            Código de rastreo para soporte: <code className="break-all">{aviso.codigoRastreo}</code>
          </p>
        )}
      </div>
    </div>
  )
}
