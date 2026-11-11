import { useState } from 'react'
import { ConfirmacionReserva } from '../components/reservas/ConfirmacionReserva'
import { FormularioReserva } from '../components/reservas/FormularioReserva'

// Página para solicitar una reserva (RF-03): el formulario y, al registrar, su confirmación.
export function NuevaReserva() {
  const [registrada, setRegistrada] = useState(null)

  return (
    <section>
      {registrada ? (
        <div className="max-w-3xl">
          <ConfirmacionReserva reserva={registrada} alSolicitarOtra={() => setRegistrada(null)} />
        </div>
      ) : (
        <FormularioReserva alRegistrar={setRegistrada} />
      )}
    </section>
  )
}
