// Rejilla decorativa de la banda (diseño AD01): cuadros redondeados apenas más claros que el fondo azul, con uno
// dorado que rompe la trama. Es adorno: no dice nada que el texto no diga, así que va oculta al lector de pantalla.
const REJILLA = [
  'suave', 'suave', 'claro', 'suave', 'suave', 'claro', 'suave', 'suave',
  'claro', 'suave', 'suave', 'suave', 'claro', 'suave', 'claro', 'suave',
  'suave', 'claro', 'suave', 'suave', 'suave', 'dorado', 'suave', 'claro',
]

const TONOS = {
  suave: 'bg-white/10',
  claro: 'bg-white/20',
  dorado: 'bg-acento',
}

// Banda de bienvenida del panel principal (diseños AD01, S01, R01 y T2): el título de la página, el saludo que resume
// lo que importa del rol y la acción principal, sobre el azul de la marca. Reemplaza al encabezado suelto: la página
// empieza con un bloque que dice quién entró y qué puede hacer de inmediato.
export function BandaDeBienvenida({ titulo = 'Panel principal', resumen, accion }) {
  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-marca-900 via-marca-800 to-marca-700 px-5 py-5 text-white shadow-sm sm:px-8">
      <title>{`${titulo} · ReservaUPLA`}</title>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
            {titulo}
          </h1>
          {resumen && <p className="mt-1 text-marca-100">{resumen}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <span aria-hidden="true" className="hidden grid-cols-8 gap-2 xl:grid">
            {REJILLA.map((tono, indice) => (
              <span key={indice} className={`size-6 rounded-md ${TONOS[tono]}`} />
            ))}
          </span>
          {accion && <div className="w-full sm:w-auto">{accion}</div>}
        </div>
      </div>
    </header>
  )
}
