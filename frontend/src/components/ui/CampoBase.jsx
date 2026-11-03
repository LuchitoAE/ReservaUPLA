import { cloneElement } from 'react'

// Lo común de todos los campos (TextInput, SelectInput, DateInput, TimeInput): etiqueta, control, ayuda y error,
// siempre en ese orden y con el mismo aspecto. El borde rojo sale del propio aria-invalid: lo que se ve y lo que
// anuncia un lector de pantalla no pueden contradecirse.
const ESTILO_CONTROL =
  'w-full min-h-11 rounded-lg border border-borde-control bg-superficie px-3 py-2.5 text-texto placeholder:text-texto-suave ' +
  'focus:border-foco focus:outline-3 focus:outline-foco/30 disabled:cursor-not-allowed disabled:bg-superficie-tenue ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:focus:outline-error/30'

export function CampoBase({ id, etiqueta, obligatorio = false, ayuda, error, contador, className = '', children }) {
  const idAyuda = ayuda ? `${id}-ayuda` : null
  const idError = error ? `${id}-error` : null
  const descritoPor = [idError, idAyuda].filter(Boolean).join(' ')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-semibold text-texto">
        {etiqueta}
        {obligatorio && (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {cloneElement(children, {
        id,
        name: id,
        'aria-invalid': Boolean(error),
        'aria-describedby': descritoPor || undefined,
        'aria-required': obligatorio || undefined,
        className: `${ESTILO_CONTROL} ${children.props.className ?? ''}`,
      })}
      {(ayuda || contador) && (
        <div className="flex gap-3 text-sm text-texto-suave">
          {ayuda && <span id={idAyuda}>{ayuda}</span>}
          {contador && <span className="ml-auto shrink-0 tabular-nums">{contador}</span>}
        </div>
      )}
      {error && (
        <p id={idError} className="flex gap-1.5 text-sm font-medium text-error">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}
