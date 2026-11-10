import { REGLAS_DE_CONTRASENA } from '../../reglas/usuario'

// Las reglas de la contraseña a la vista, marcadas a medida que se cumplen (feedback inmediato y menos carga de
// memoria: el usuario no tiene que recordar qué se pedía). Cada regla es una ficha: verde con el visto cuando se
// cumple, gris mientras falta (diseño S15). Se anuncian sin interrumpir.
export function ReglasDeContrasena({ valor, id }) {
  return (
    <ul id={id} aria-live="polite" className="flex flex-wrap gap-2">
      {REGLAS_DE_CONTRASENA.map((regla) => {
        const cumple = regla.cumple(valor)
        return (
          <li
            key={regla.texto}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.8125rem] ${
              cumple ? 'border-exito/30 bg-exito-fondo font-medium text-exito-texto' : 'border-borde bg-superficie-tenue text-texto-suave'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                cumple ? 'bg-exito text-white' : 'border border-borde-fuerte'
              }`}
            >
              {cumple ? '✓' : ''}
            </span>
            {regla.texto}
            <span className="sr-only">{cumple ? '(cumple)' : '(falta)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
