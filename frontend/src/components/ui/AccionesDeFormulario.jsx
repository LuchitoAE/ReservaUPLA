import { Button } from './Button'

// Pie de todo formulario: «Cancelar» vuelve a la lista sin guardar; el botón principal envía. En el teléfono el
// principal queda arriba, al alcance del pulgar; en pantallas grandes, a la derecha, donde termina la lectura.
export function AccionesDeFormulario({ volverA, enviando, texto, textoEnviando }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button destino={volverA}>Cancelar</Button>
      <Button type="submit" variante="principal" ocupado={enviando}>
        {enviando ? textoEnviando : texto}
      </Button>
    </div>
  )
}
