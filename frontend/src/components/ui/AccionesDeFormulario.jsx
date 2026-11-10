import { Button } from './Button'
import { Icono } from './Icono'
import { ModalConfirmacion } from './ModalConfirmacion'

// «A, B y C»
function enumerar(nombres) {
  return nombres.length < 2 ? nombres.join('') : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

// Pie de todo formulario. Restricción (Norman): el botón principal queda deshabilitado mientras falten datos
// obligatorios o haya un impedimento («bloqueado»), y al lado se dice qué falta: el usuario no adivina por qué no
// puede continuar (visibilidad). «Cancelar» vuelve sin guardar; si hay datos escritos, se pregunta antes de
// descartarlos (reversión fácil, Shneiderman). En el teléfono el botón principal queda arriba, al alcance del pulgar.
// Si el envío falló, la misma línea lo dice en rojo, junto al botón (RNF-04): el error no aparece arriba ni empuja el
// formulario, y el foco ya está en el primer campo por corregir.
export function AccionesDeFormulario({ formulario, volverA, texto, textoEnviando, bloqueado, icono }) {
  const { faltan, enviando, bloqueo, resumenDeError } = formulario
  const motivo = bloqueado ?? (faltan.length > 0 ? `Para continuar, complete: ${enumerar(faltan)}.` : null)

  return (
    <div className="flex flex-col gap-3 border-t border-borde pt-5">
      <p
        id="motivo-envio"
        aria-live="polite"
        className={`flex gap-1.5 text-sm ${resumenDeError ? 'font-medium text-error' : motivo ? 'text-texto-suave' : 'text-exito'}`}
      >
        {resumenDeError ? (
          <>
            <span aria-hidden="true">⚠</span>
            {resumenDeError}
          </>
        ) : (
          (motivo ?? '✓ Todo listo para enviar.')
        )}
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button destino={volverA}>Cancelar</Button>
        <Button type="submit" variante="principal" ocupado={enviando} disabled={Boolean(motivo)} aria-describedby="motivo-envio">
          {!enviando && icono && <Icono nombre={icono} />}
          {enviando ? textoEnviando : texto}
        </Button>
      </div>
      <ModalConfirmacion
        abierto={bloqueo.state === 'blocked'}
        titulo="¿Salir sin guardar?"
        textoConfirmar="Descartar y salir"
        textoCancelar="Seguir editando"
        variante="peligro"
        alConfirmar={() => bloqueo.proceed?.()}
        alCancelar={() => bloqueo.reset?.()}
      >
        <p>Los datos que escribió en este formulario todavía no se guardaron y se perderán.</p>
      </ModalConfirmacion>
    </div>
  )
}
