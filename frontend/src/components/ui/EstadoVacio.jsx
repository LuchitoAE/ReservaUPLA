import { Icono } from './Icono'

// Estado vacío de un listado o de una sección (diseños S02, S10 y AD03): un ícono en un círculo, qué pasa, qué puede
// hacer la persona y, si hay una salida clara, el botón que la resuelve. Sirve para distinguir «todavía no hay nada»
// de «los filtros no encontraron nada»: el texto lo dice, no solo el ícono (WCAG 1.4.1).
export function EstadoVacio({ icono = 'buscar', titulo, texto, accion }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-seleccion text-foco" aria-hidden="true">
        <Icono nombre={icono} className="size-8" />
      </span>
      <h2 className="text-lg font-semibold text-titulo">{titulo}</h2>
      {texto && <p className="max-w-md text-texto-suave">{texto}</p>}
      {accion && <div className="mt-1 flex flex-wrap justify-center gap-3">{accion}</div>}
    </div>
  )
}
