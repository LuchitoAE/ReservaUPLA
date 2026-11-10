import { useState } from 'react'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { ConfirmacionReserva } from '../components/reservas/ConfirmacionReserva'
import { FormularioReserva } from '../components/reservas/FormularioReserva'

// Página para solicitar una reserva (RF-03): el formulario y, al registrar, su confirmación.
export function NuevaReserva() {
  const [registrada, setRegistrada] = useState(null)

  return (
    <>
      <EncabezadoDePagina
        titulo="Nueva reserva"
        descripcion="Solicite un ambiente para una fecha y un horario entre las 07:00 y las 22:00. Queda a nombre de quien inició sesión."
      />
      <section>
        {registrada ? (
          <div className="max-w-3xl">
            <ConfirmacionReserva reserva={registrada} alSolicitarOtra={() => setRegistrada(null)} />
          </div>
        ) : (
          <FormularioReserva alRegistrar={setRegistrada} />
        )}
      </section>
    </>
  )
}
