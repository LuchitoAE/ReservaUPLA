import { useEffect } from 'react'
import { listarAmbientes } from '../../api/ambientesApi'
import { registrarReserva } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { useFormulario } from '../../hooks/useFormulario'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { horarioCompleto, normalizarReserva, RESERVA, reglasDeReserva } from '../../reglas/reserva'
import { ahoraEnPeru } from '../../utils/fechas'
import { ROLES, TIPOS_AMBIENTE } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { DateInput } from '../ui/DateInput'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'
import { TimeInput } from '../ui/TimeInput'
import { PanelDisponibilidad } from './PanelDisponibilidad'

const INICIALES = {
  id_usuario: '',
  id_ambiente: '',
  fecha_reserva: '',
  hora_inicio_reserva: '',
  hora_fin_reserva: '',
  motivo_reserva: '',
}

// RF-03 y RF-04: solicitar una reserva. El solicitante es el usuario actual; mientras se eligen el ambiente, la
// fecha y las horas, el panel dice si el horario está libre. La API vuelve a revisar todo al registrar.
export function FormularioReserva({ alRegistrar }) {
  const { usuarioActual } = useUsuarioActual()
  const ambientes = useConsulta(() => listarAmbientes({ estado_ambiente: 'Disponible' }), [])
  const { valores, errores, campo, cambiar, enviar, enviando, aviso } = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeReserva,
    alEnviar: async (datos) => {
      const respuesta = await registrarReserva(normalizarReserva(datos))
      alRegistrar(respuesta.data)
    },
  })
  const disponibilidad = useDisponibilidad(valores, horarioCompleto(valores))

  // El solicitante sigue al usuario actual de la barra lateral, aunque se cambie con el formulario abierto.
  const idUsuarioActual = usuarioActual?.id_usuario ?? ''
  useEffect(() => {
    cambiar('id_usuario', idUsuarioActual)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuarioActual])

  const opcionesDeAmbiente = (ambientes.datos ?? []).map((ambiente) => ({
    valor: ambiente.id_ambiente,
    etiqueta: `${ambiente.nombre_ambiente} · ${TIPOS_AMBIENTE[ambiente.tipo_ambiente]} · ${ambiente.capacidad_ambiente} personas`,
  }))

  return (
    <form noValidate onSubmit={enviar} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-5">
        <NotaObligatorios />
        {aviso && <AlertMessage tipo="error" aviso={aviso} />}

        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-texto">Solicitante</p>
          <div
            id="id_usuario"
            tabIndex={-1}
            aria-describedby={errores.id_usuario ? 'id_usuario-error' : undefined}
            className={`rounded-lg border bg-superficie-tenue px-3 py-2.5 focus:outline-3 focus:outline-foco/30 ${errores.id_usuario ? 'border-error' : 'border-borde-fuerte'}`}
          >
            {usuarioActual ? (
              <span>
                {usuarioActual.nombre_completo_usuario}{' '}
                <span className="text-texto-suave">· {ROLES[usuarioActual.rol_usuario]}</span>
              </span>
            ) : (
              <span className="text-texto-suave">Sin usuario actual</span>
            )}
          </div>
          {errores.id_usuario && (
            <p id="id_usuario-error" className="flex gap-1.5 text-sm font-medium text-error">
              <span aria-hidden="true">⚠</span>
              {errores.id_usuario}
            </p>
          )}
        </div>

        <SelectInput
          {...campo('id_ambiente')}
          etiqueta="Ambiente"
          obligatorio
          ayuda="Solo aparecen los ambientes disponibles."
          opciones={opcionesDeAmbiente}
          textoVacio={ambientes.cargando ? 'Cargando ambientes…' : 'Elija el ambiente'}
        />
        <DateInput {...campo('fecha_reserva')} etiqueta="Fecha" obligatorio minimo={ahoraEnPeru().fecha} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TimeInput
            {...campo('hora_inicio_reserva')}
            etiqueta="Hora de inicio"
            obligatorio
            minimo={RESERVA.apertura}
            maximo={RESERVA.cierre}
            ayuda="Desde las 07:00."
          />
          <TimeInput
            {...campo('hora_fin_reserva')}
            etiqueta="Hora de fin"
            obligatorio
            minimo={RESERVA.apertura}
            maximo={RESERVA.cierre}
            ayuda="Hasta las 22:00."
          />
        </div>
        <TextInput
          {...campo('motivo_reserva')}
          multilinea
          etiqueta="Motivo"
          obligatorio
          maximo={RESERVA.motivoMaximo}
          ayuda="Para qué necesita el ambiente: clase, práctica, reunión, evento…"
        />
        <AccionesDeFormulario volverA="/" enviando={enviando} texto="Solicitar reserva" textoEnviando="Solicitando…" />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <PanelDisponibilidad disponibilidad={disponibilidad} />
      </div>
    </form>
  )
}
