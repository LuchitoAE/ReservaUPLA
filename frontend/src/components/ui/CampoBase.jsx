import { cloneElement } from 'react'
import { Icono } from './Icono'

// Lo común de todos los campos (TextInput, SelectInput, DateInput, TimeInput): etiqueta, control y una línea debajo,
// siempre en ese orden y con el mismo aspecto. El borde rojo sale del propio aria-invalid: lo que se ve y lo que
// anuncia un lector de pantalla no pueden contradecirse.
const ESTILO_CONTROL =
  'w-full min-h-11 rounded-lg border border-borde-control bg-superficie px-3 py-2.5 text-texto placeholder:text-texto-suave ' +
  'focus:border-foco focus:outline-3 focus:outline-foco/30 disabled:cursor-not-allowed disabled:bg-superficie-tenue ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:focus:outline-error/30'

// La línea bajo el control siempre ocupa su lugar (RNF-04, diseño S05): muestra el error si lo hay; si no, el aviso
// (por ejemplo, Bloq Mayús activado, que no es un error); si no, la ayuda. Así un error no agranda el campo ni empuja
// lo que sigue. «contador» va a la derecha de esa línea. «icono»: una pista dentro del control, a la izquierda (la
// credencial del código, el candado de la contraseña), siempre decorativa porque la etiqueta ya nombra el campo.
// «adorno»: algo dentro del control, a la derecha (el ojo que muestra la contraseña).
export function CampoBase({ id, etiqueta, obligatorio = false, ayuda, error, contador, adorno, aviso, icono, className = '', children }) {
  const idAyuda = ayuda ? `${id}-ayuda` : null
  const idError = error ? `${id}-error` : null
  const descritoPor = error ? idError : idAyuda

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
      <div className="relative">
        {icono && (
          <Icono
            nombre={icono}
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
          />
        )}
        {cloneElement(children, {
          id,
          name: id,
          'aria-invalid': Boolean(error),
          'aria-describedby': descritoPor || undefined,
          'aria-required': obligatorio || undefined,
          className: `${ESTILO_CONTROL} ${icono ? 'pl-11' : ''} ${adorno ? 'pr-12' : ''} ${children.props.className ?? ''}`,
        })}
        {adorno}
      </div>
      <div className="flex min-h-5 gap-3 text-sm">
        {error ? (
          <p id={idError} className="flex gap-1.5 font-medium text-error">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        ) : aviso ? (
          <p role="status" className="flex gap-1.5 font-medium text-aviso">
            <span aria-hidden="true">!</span>
            {aviso}
          </p>
        ) : (
          ayuda && (
            <span id={idAyuda} className="text-texto-suave">
              {ayuda}
            </span>
          )
        )}
        {contador && <span className="ml-auto shrink-0 text-texto-suave tabular-nums">{contador}</span>}
      </div>
    </div>
  )
}
