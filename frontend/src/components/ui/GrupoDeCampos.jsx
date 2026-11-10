// Agrupación semántica (arquitectura de la información): los campos que responden a la misma pregunta van juntos
// en una tarjeta con número, título y descripción. El usuario ve de un vistazo cuántas partes tiene el formulario y
// en cuál está (visibilidad y modelo mental, Norman). Es un <fieldset>: el lector de pantalla anuncia el grupo con
// el título; el número y el texto visibles van dentro de la tarjeta, como en los diseños AD13 y AD16.
// «columnas» reparte los campos: 2 columnas, o 3 para los datos de la persona.
const REPARTOS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
}

export function GrupoDeCampos({ numero, titulo, descripcion, columnas = 1, children }) {
  return (
    <fieldset className="min-w-0 rounded-xl border border-borde bg-superficie p-4 sm:p-5">
      <legend className="sr-only">{`${numero}. ${titulo}`}</legend>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-titulo">
          {numero}. {titulo}
        </h2>
        {descripcion && <p className="mt-0.5 text-sm text-texto-suave">{descripcion}</p>}
      </div>
      <div className={`grid gap-5 ${REPARTOS[columnas] ?? ''}`}>{children}</div>
    </fieldset>
  )
}
