// Reservas por ambiente, de más a menos (sustenta el indicador «Ambiente más utilizado»). Barras horizontales de un
// solo tono sobre una misma base: se comparan de un vistazo. Cada fila dice además su cifra en texto, así que la
// barra es apoyo visual (aria-hidden) y la información se lee igual sin color.
export function UsoDeAmbientes({ usos }) {
  const maximo = Math.max(1, ...usos.map((uso) => uso.total_reservas))

  if (usos.length === 0) {
    return <p className="text-texto-suave">Todavía no hay ambientes registrados.</p>
  }

  return (
    <ol className="flex flex-col gap-3">
      {usos.map((uso) => (
        <li key={uso.id_ambiente} className="grid gap-1.5 sm:grid-cols-[15rem_minmax(0,1fr)] sm:items-center sm:gap-4">
          <span className="font-medium break-words">{uso.nombre_ambiente}</span>
          <span className="flex items-center gap-3">
            <span className="h-5 flex-1" aria-hidden="true">
              {uso.total_reservas > 0 && (
                <span
                  className="block h-full rounded-r bg-barra"
                  style={{ width: `${(uso.total_reservas / maximo) * 100}%` }}
                />
              )}
            </span>
            <span className="w-48 shrink-0 text-sm text-texto-suave">
              <strong className="text-texto tabular-nums">{uso.total_reservas}</strong>{' '}
              {uso.total_reservas === 1 ? 'reserva' : 'reservas'} · {uso.reservas_aprobadas}{' '}
              {uso.reservas_aprobadas === 1 ? 'aprobada' : 'aprobadas'}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}
