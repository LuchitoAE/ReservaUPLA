import { useEffect, useState } from 'react'
import { Icono } from '../components/ui/Icono'
import { duracionDelAviso } from './centralDeAvisos'

// Apariencia de cada tipo con el semáforo de estados (RNF-05): aprobada en verde, pendiente en ámbar, rechazada en
// rojo, cancelada en gris. El color nunca va solo: lo acompañan el ícono y el título (WCAG 1.4.1).
const APARIENCIA = {
  aprobada: { icono: 'aprobada', franja: 'border-l-exito', mosaico: 'bg-aprobada-fondo text-aprobada-texto' },
  exito: { icono: 'aprobada', franja: 'border-l-exito', mosaico: 'bg-aprobada-fondo text-aprobada-texto' },
  pendiente: { icono: 'pendiente', franja: 'border-l-aviso', mosaico: 'bg-pendiente-fondo text-pendiente-texto' },
  rechazada: { icono: 'rechazada', franja: 'border-l-error', mosaico: 'bg-rechazada-fondo text-rechazada-texto' },
  error: { icono: 'error', franja: 'border-l-error', mosaico: 'bg-rechazada-fondo text-rechazada-texto' },
  cancelada: { icono: 'cancelada', franja: 'border-l-cancelada-texto', mosaico: 'bg-cancelada-fondo text-cancelada-texto' },
  info: { icono: 'info', franja: 'border-l-info', mosaico: 'bg-info-fondo text-info' },
}

// Un aviso: superficie con franja y mosaico del color del tipo, título, texto y botón Cerrar (diseño AD08). Se cierra
// solo a los 8 s, pero no mientras el puntero o el foco están encima (WCAG 2.2.1); los errores y los que piden hacer
// algo esperan a que la persona los cierre.
export function AvisoFlotante({ aviso, alCerrar }) {
  const [enUso, setEnUso] = useState(false)
  const duracion = duracionDelAviso(aviso)
  const { icono, franja, mosaico } = APARIENCIA[aviso.tipo] ?? APARIENCIA.info

  useEffect(() => {
    if (duracion === null || enUso) {
      return undefined
    }
    const temporizador = setTimeout(() => alCerrar(aviso.id), duracion)
    return () => clearTimeout(temporizador)
  }, [duracion, enUso, alCerrar, aviso.id])

  return (
    <div
      className={`pointer-events-auto flex gap-3 rounded-xl border border-l-4 border-borde bg-superficie p-4 shadow-lg ${franja}`}
      onMouseEnter={() => setEnUso(true)}
      onMouseLeave={() => setEnUso(false)}
      onFocus={() => setEnUso(true)}
      onBlur={(evento) => !evento.currentTarget.contains(evento.relatedTarget) && setEnUso(false)}
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${mosaico}`}>
        <Icono nombre={icono} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-titulo">{aviso.titulo}</p>
        {aviso.texto && <p className="mt-0.5 text-sm text-texto-suave">{aviso.texto}</p>}
      </div>
      <button
        type="button"
        onClick={() => alCerrar(aviso.id)}
        aria-label={`Cerrar el aviso «${aviso.titulo}»`}
        title="Cerrar"
        className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-texto-suave hover:bg-superficie-tenue hover:text-texto focus-visible:outline-3 focus-visible:outline-foco"
      >
        <Icono nombre="cerrar" className="size-4" />
      </button>
    </div>
  )
}
