import { useEffect, useState } from 'react'
import { useConsultaDeMedio } from '../../hooks/useConsultaDeMedio'
import { DURACION_DE_BORRADO_MS } from '../../utils/tiempos'

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

const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)'

// El título se borra y se vuelve a escribir al cambiar de sección (70 ms + 120 ms). La banda y su fondo no se mueven:
// solo el texto. Con «menos movimiento» el cambio es inmediato.
function useTituloAnimado(titulo) {
  const [visible, setVisible] = useState(titulo)
  const menosMovimiento = useConsultaDeMedio(MENOS_MOVIMIENTO)

  useEffect(() => {
    if (titulo === visible) {
      return undefined
    }
    const temporizador = setTimeout(() => setVisible(titulo), DURACION_DE_BORRADO_MS)
    return () => clearTimeout(temporizador)
  }, [titulo, visible])

  // Con «menos movimiento» se muestra el título nuevo en el acto; si no, mientras no coincidan, el viejo se borra.
  return {
    visible: menosMovimiento ? titulo : visible,
    saliendo: !menosMovimiento && visible !== titulo,
  }
}

// Banda azul de todas las páginas del sistema (diseños AD01, S01 y R01, extendida al resto por decisión del alumno):
// el título, la descripción, la insignia de estado y la acción principal, sobre el azul de la marca. Vive en el layout
// para quedarse quieta al navegar; las páginas solo cambian su contenido.
export function BandaDeSeccion({ titulo, descripcion, insignia, accion, accionEnTelefono = true }) {
  const { visible, saliendo } = useTituloAnimado(titulo)

  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-banda-1 via-banda-2 to-banda-3 px-5 py-5 text-white shadow-tarjeta sm:px-8">
      <title>{`${titulo} · ReservaUPLA`}</title>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="titulo-pagina" tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
              <span key={visible} className={saliendo ? 'titulo-saliendo' : 'titulo-entrando'}>
                {visible}
              </span>
            </h1>
            {insignia}
          </div>
          {descripcion && <p className="mt-1 text-marca-100">{descripcion}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <span aria-hidden="true" className="hidden grid-cols-8 gap-2 xl:grid">
            {REJILLA.map((tono, indice) => (
              <span key={indice} className={`size-6 rounded-md ${TONOS[tono]}`} />
            ))}
          </span>
          {accion && <div className={accionEnTelefono ? '' : 'hidden sm:block'}>{accion}</div>}
        </div>
      </div>
    </header>
  )
}
