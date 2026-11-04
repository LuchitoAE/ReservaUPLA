// Agrupación semántica (arquitectura de la información): los campos que responden a la misma pregunta van juntos
// en una tarjeta con número, título y descripción. El usuario ve de un vistazo cuántas partes tiene el formulario y
// en cuál está (visibilidad y modelo mental, Norman). Es un <fieldset>: el lector de pantalla anuncia el grupo.
export function GrupoDeCampos({ numero, titulo, descripcion, children }) {
  return (
    <fieldset className="min-w-0 rounded-xl border border-borde bg-superficie p-4 sm:p-5">
      <legend className="float-left mb-4 flex w-full items-start gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-marca-700 text-sm font-bold text-white"
          aria-hidden="true"
        >
          {numero}
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-titulo">{titulo}</span>
          {descripcion && <span className="text-sm text-texto-suave">{descripcion}</span>}
        </span>
      </legend>
      <div className="clear-both flex flex-col gap-5">{children}</div>
    </fieldset>
  )
}
