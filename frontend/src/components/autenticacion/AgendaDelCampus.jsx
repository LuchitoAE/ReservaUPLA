import azul1 from '../../assets/campus/azul-1.webp'
import azul2 from '../../assets/campus/azul-2.webp'
import azul3 from '../../assets/campus/azul-3.webp'
import azul4 from '../../assets/campus/azul-4.webp'
import campus1 from '../../assets/campus/campus-1.webp'
import campus2 from '../../assets/campus/campus-2.webp'
import campus3 from '../../assets/campus/campus-3.webp'
import campus4 from '../../assets/campus/campus-4.webp'
import logoUpla from '../../assets/logo-upla-blanco.png'
import { useAgendaViva } from '../../hooks/useAgendaViva'
import { useFotoDeLaVisita } from '../../hooks/useFotoDeLaVisita'
import { Icono } from '../ui/Icono'
import { AGENDA_DEL_TELEFONO, COLUMNAS, ENCUADRES, FILAS, estaBajoElTexto } from './agendaDelCampus'

// Fotos del campus de la UPLA (Huancayo) tomadas por Luis Walter Aquino Espinoza, en el azul de la marca y a color.
const FOTOS = {
  1: { azul: azul1, color: campus1 },
  2: { azul: azul2, color: campus2 },
  3: { azul: azul3, color: campus3 },
  4: { azul: azul4, color: campus4 },
}

// Panel de la marca en el ingreso (AC01): la agenda sobre la foto del campus, la bienvenida y, en el escritorio, el pie
// con el botón para pausar la animación. En el teléfono es una franja arriba, con los bloques fijos (T1).
export function AgendaDelCampus() {
  const foto = useFotoDeLaVisita()
  const encuadre = ENCUADRES[foto]
  const { estado, puedeMoverse, pausada, alternarPausa } = useAgendaViva(encuadre)
  const fotos = { '--foto-azul': `url("${FOTOS[foto].azul}")`, '--foto-color': `url("${FOTOS[foto].color}")` }

  return (
    <aside className="agenda relative h-75 overflow-hidden bg-noche text-white lg:h-auto lg:min-h-screen" style={fotos}>
      <RejillaDeBloques
        className="agenda-escritorio hidden lg:grid"
        filas={FILAS}
        columnas={COLUMNAS}
        foto={encuadre}
        reservados={estado.reservados}
        elegido={estado.elegido}
        bajoElTexto={estaBajoElTexto}
      />
      <RejillaDeBloques
        className="agenda-telefono grid lg:hidden"
        filas={AGENDA_DEL_TELEFONO.filas}
        columnas={AGENDA_DEL_TELEFONO.columnas}
        foto={{ zoom: AGENDA_DEL_TELEFONO.zoom, ...encuadre.telefono }}
        reservados={AGENDA_DEL_TELEFONO.reservados}
        elegido={AGENDA_DEL_TELEFONO.elegido}
        bajoElTexto={() => false}
      />

      {/* En el escritorio, los textos usan la misma rejilla: caen justo sobre los bloques oscuros. */}
      <div className="agenda-escritorio relative flex h-30 flex-col justify-center max-lg:px-4 lg:agenda-rejilla lg:grid lg:h-full">
        <div className="flex flex-col gap-2 lg:col-span-2 lg:row-span-3 lg:gap-[clamp(1rem,4cqh,2.5rem)] lg:py-[clamp(1rem,4.9cqw,2.875rem)] lg:pr-2 lg:pl-[clamp(1rem,4.9cqw,2.875rem)]">
          <img src={logoUpla} alt="Universidad Peruana Los Andes" className="h-8 w-auto self-start lg:h-11" />
          <div>
            <p className="text-xs font-semibold tracking-wider text-acento uppercase lg:text-sm">Reservas de ambientes</p>
            <p className="text-2xl leading-tight font-bold lg:text-[length:clamp(1.5rem,4.6cqw,3rem)]">ReservaUPLA</p>
            <p className="mt-3 hidden text-marca-100 lg:block lg:text-[length:clamp(0.875rem,1.75cqw,1.0625rem)]">
              Laboratorios, auditorios y salas de la universidad, en un solo lugar.
            </p>
          </div>
        </div>
        <div className="hidden items-center justify-between gap-4 px-[clamp(1rem,4.9cqw,2.875rem)] lg:col-span-5 lg:row-start-7 lg:flex">
          <p className="text-sm text-marca-100">Universidad Peruana Los Andes · Huancayo</p>
          {puedeMoverse && (
            <button
              type="button"
              onClick={alternarPausa}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/60 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acento active:bg-white/20"
            >
              <Icono nombre={pausada ? 'reproducir' : 'pausa'} className="size-4" />
              {pausada ? 'Reanudar animación' : 'Pausar animación'}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// Los bloques de la agenda (decorativos: el lector de pantalla no los anuncia). Cada uno recibe su fila y su columna
// para correr la foto; los reservados muestran la foto a color y los que quedan bajo el texto, azul noche.
function RejillaDeBloques({ className, filas, columnas, foto, reservados, elegido, bajoElTexto }) {
  const esReservado = (fila, columna) => reservados.some(([f, c]) => f === fila && c === columna)
  const bloques = []
  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      bloques.push(
        <div
          key={`${fila}-${columna}`}
          className="agenda-bloque"
          style={{ '--fila': fila, '--columna': columna }}
          data-reservado={esReservado(fila, columna) || undefined}
          data-bajo-texto={bajoElTexto([fila, columna]) || undefined}
        />,
      )
    }
  }

  return (
    <div
      aria-hidden="true"
      className={`agenda-rejilla absolute inset-0 ${className}`}
      style={{ '--zoom': foto.zoom, '--foto-x': foto.x, '--foto-y': foto.y }}
    >
      {bloques}
      <div className="agenda-elegido" style={{ '--fila': elegido[0], '--columna': elegido[1] }} />
    </div>
  )
}
