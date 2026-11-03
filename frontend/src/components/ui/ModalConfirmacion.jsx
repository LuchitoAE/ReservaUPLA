import { useEffect, useRef } from 'react'
import { Button } from './Button'

// Pide confirmación antes de una acción que no se puede deshacer (componente «ModalConfirmacion» del caso).
// Usa <dialog> del navegador: atrapa el foco dentro, se cierra con Esc y deja el resto de la página inerte.
// El foco empieza en «Volver», la opción segura: confirmar exige un paso deliberado.
export function ModalConfirmacion({ abierto, titulo, children, textoConfirmar, variante = 'principal', ocupado = false, alConfirmar, alCancelar }) {
  const dialogo = useRef(null)

  useEffect(() => {
    const elemento = dialogo.current
    if (abierto && !elemento.open) {
      elemento.showModal()
    } else if (!abierto && elemento.open) {
      elemento.close()
    }
  }, [abierto])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-confirmacion"
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) {
          alCancelar()
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-borde bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="titulo-confirmacion" className="text-xl font-bold text-titulo">
          {titulo}
        </h2>
        <div className="text-texto-suave">{children}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={alCancelar} disabled={ocupado} autoFocus>
            Volver
          </Button>
          <Button variante={variante} onClick={alConfirmar} ocupado={ocupado}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
