import { REGLAS_DE_CONTRASENA } from '../../reglas/usuario'

// Las reglas de la contraseña a la vista, marcadas a medida que se cumplen (feedback inmediato y menos carga de
// memoria: el usuario no tiene que recordar qué se pedía). Se anuncian sin interrumpir.
export function ReglasDeContrasena({ valor, id }) {
  return (
    <ul id={id} aria-live="polite" className="grid gap-1 text-sm sm:grid-cols-2">
      {REGLAS_DE_CONTRASENA.map((regla) => {
        const cumple = regla.cumple(valor)
        return (
          <li key={regla.texto} className={`flex items-center gap-2 ${cumple ? 'text-exito' : 'text-texto-suave'}`}>
            <span aria-hidden="true" className="w-4 text-center font-bold">
              {cumple ? '✓' : '○'}
            </span>
            {regla.texto}
            <span className="sr-only">{cumple ? '(cumple)' : '(falta)'}</span>
          </li>
        )
      })}
    </ul>
  )
}
