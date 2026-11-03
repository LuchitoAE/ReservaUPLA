// Tabla reutilizable (componente «TableList» del caso): la usan las reservas, los ambientes y los usuarios.
// Las columnas se describen una vez: [{ clave, titulo, celda?(fila), alinear? }]. En pantallas medianas y grandes
// se ve como tabla; en el teléfono, como tarjetas con «título: valor», sin barra de desplazamiento horizontal.
export function TableList({ titulo, columnas, filas, claveFila, cargando = false, vacio = 'No hay registros.' }) {
  if (cargando) {
    return (
      <p role="status" className="rounded-xl border border-borde bg-superficie p-6 text-texto-suave">
        Cargando {titulo.toLowerCase()}…
      </p>
    )
  }

  if (filas.length === 0) {
    return <p className="rounded-xl border border-dashed border-borde-fuerte bg-superficie p-6 text-texto-suave">{vacio}</p>
  }

  const valor = (columna, fila) => (columna.celda ? columna.celda(fila) : fila[columna.clave])

  return (
    <div className="rounded-xl border border-borde bg-superficie">
      <table className="hidden w-full text-left md:table">
        <caption className="sr-only">{titulo}</caption>
        <thead className="border-b border-borde bg-superficie-tenue text-sm text-texto-suave">
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} scope="col" className={`px-4 py-3 font-semibold ${columna.alinear === 'derecha' ? 'text-right' : ''}`}>
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {filas.map((fila) => (
            <tr key={fila[claveFila]} className="hover:bg-superficie-tenue">
              {columnas.map((columna) => (
                <td key={columna.clave} className={`px-4 py-3 align-top ${columna.alinear === 'derecha' ? 'text-right tabular-nums' : ''}`}>
                  {valor(columna, fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde md:hidden" aria-label={titulo}>
        {filas.map((fila) => (
          <li key={fila[claveFila]} className="p-4">
            <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-3 gap-y-1.5">
              {columnas.map((columna) => (
                <div key={columna.clave} className="contents">
                  <dt className="text-sm text-texto-suave">{columna.titulo}</dt>
                  <dd className="min-w-0 break-words">{valor(columna, fila)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
