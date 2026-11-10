import { Link, useNavigate } from 'react-router'
import { Cargando } from './Cargando'
import { EstadoVacio } from './EstadoVacio'
import { Icono } from './Icono'

// Tabla reutilizable (componente «TableList» del caso): la usan las reservas, los ambientes y los usuarios.
// Las columnas se describen una vez: [{ clave, titulo, celda?(fila), alinear? }]. En pantallas medianas y grandes
// se ve como tabla; en el teléfono, como tarjetas con «título: valor», sin barra de desplazamiento horizontal.
// «filaNueva»: la clave de un registro recién creado; su fila se resalta y lleva la marca «Nuevo» (RNF-04).
// «accion»: { texto, destino(fila), describir?(fila) }; añade la columna «Ver ›» y, además, toda la fila abre el
// detalle (el enlace queda para el teclado y para quien lee con lector de pantalla).
// «notaPie»: la línea que explica la tabla, al pie de la tarjeta (diseños S09, AD12 y AD15).
export function TableList({
  titulo,
  columnas,
  filas,
  claveFila,
  filaNueva = null,
  cargando = false,
  vacio = 'No hay registros.',
  textoVacio,
  iconoVacio = 'info',
  accionVacio = null,
  accion = null,
  notaPie,
}) {
  const navegar = useNavigate()

  if (cargando) {
    return <Cargando texto={`Cargando ${titulo.toLowerCase()}…`} />
  }

  const esNueva = (fila) => filaNueva !== null && fila[claveFila] === filaNueva
  const valor = (columna, fila) => {
    const contenido = columna.celda ? columna.celda(fila) : fila[columna.clave]
    return columna === columnas[0] && esNueva(fila) ? (
      <>
        {contenido} <MarcaNuevo />
      </>
    ) : (
      contenido
    )
  }

  const encabezado = (
    <thead className="border-b border-borde bg-superficie-tenue text-xs tracking-wide text-texto-suave uppercase">
      <tr>
        {columnas.map((columna) => (
          <th
            key={columna.clave}
            scope="col"
            className={`px-4 py-3 font-semibold ${columna.ancho ?? ''} ${columna.alinear === 'derecha' ? 'text-right' : ''}`}
          >
            {columna.titulo}
          </th>
        ))}
        {accion && (
          <th scope="col" className="px-4 py-3 text-right font-semibold">
            <span className="sr-only">Acciones</span>
          </th>
        )}
      </tr>
    </thead>
  )

  if (filas.length === 0) {
    return (
      <div className="rounded-xl border border-borde bg-superficie shadow-tarjeta">
        <table aria-hidden="true" className="hidden w-full text-left text-sm md:table">
          {encabezado}
        </table>
        <EstadoVacio icono={iconoVacio} titulo={vacio} texto={textoVacio} accion={accionVacio} />
      </div>
    )
  }

  // Toda la fila abre el detalle, salvo que la persona esté seleccionando texto o pulsando un control propio de la fila.
  const alPulsarFila = (evento, fila) => {
    if (!accion) {
      return
    }
    if (evento.target.closest('a, button, input, select, textarea, label')) {
      return
    }
    if (window.getSelection()?.toString()) {
      return
    }
    navegar(accion.destino(fila))
  }

  const enlaceDeAccion = (fila) => (
    <Link
      to={accion.destino(fila)}
      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold whitespace-nowrap text-enlace underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-foco"
    >
      {accion.texto}
      <Icono nombre="siguiente" className="size-4" />
      <span className="sr-only">{accion.describir ? ` ${accion.describir(fila)}` : ' este registro'}</span>
    </Link>
  )

  return (
    <div className="rounded-xl border border-borde bg-superficie shadow-tarjeta">
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">{titulo}</caption>
        {encabezado}
        <tbody className="divide-y divide-borde">
          {filas.map((fila) => (
            <tr
              key={fila[claveFila]}
              onClick={(evento) => alPulsarFila(evento, fila)}
              className={`${esNueva(fila) ? 'bg-seleccion' : 'hover:bg-superficie-tenue'} ${accion ? 'cursor-pointer' : ''}`}
            >
              {columnas.map((columna) => (
                <td key={columna.clave} className={`px-4 py-3 align-top ${columna.alinear === 'derecha' ? 'text-right tabular-nums' : ''}`}>
                  {valor(columna, fila)}
                </td>
              ))}
              {accion && (
                <td className="px-4 py-3 text-right align-top">
                  {enlaceDeAccion(fila)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde md:hidden" aria-label={titulo}>
        {filas.map((fila) => (
          <li key={fila[claveFila]} className={`p-4 ${esNueva(fila) ? 'bg-seleccion' : ''}`}>
            <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-3 gap-y-1.5">
              {columnas.map((columna) => (
                <div key={columna.clave} className="contents">
                  <dt className="text-sm text-texto-suave">{columna.titulo}</dt>
                  <dd className="min-w-0 break-words">{valor(columna, fila)}</dd>
                </div>
              ))}
            </dl>
            {accion && (
              <div className="mt-2 flex justify-end">
                {enlaceDeAccion(fila)}
              </div>
            )}
          </li>
        ))}
      </ul>

      {notaPie && <p className="border-t border-borde px-4 py-3 text-sm text-texto-suave">{notaPie}</p>}
    </div>
  )
}

function MarcaNuevo() {
  return <span className="mt-1 block w-fit rounded-full bg-acento px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-acento-texto">Nuevo</span>
}
