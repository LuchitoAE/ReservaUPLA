import { listarAmbientes } from '../../api/ambientesApi'
import { registrarReserva } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { useFormulario } from '../../hooks/useFormulario'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { horarioCompleto, normalizarReserva, RESERVA, reglasDeReserva } from '../../reglas/reserva'
import { ahoraEnPeru, formatearFechaLarga } from '../../utils/fechas'
import { QUE_HACE_EL_ROL, ROLES, TIPOS_AMBIENTE } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { DateInput } from '../ui/DateInput'
import { GrupoDeCampos } from '../ui/GrupoDeCampos'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'
import { TimeInput } from '../ui/TimeInput'
import { PanelDisponibilidad } from './PanelDisponibilidad'

const INICIALES = {
  id_ambiente: '',
  fecha_reserva: '',
  hora_inicio_reserva: '',
  hora_fin_reserva: '',
  motivo_reserva: '',
}
const OBLIGATORIOS = {
  id_ambiente: 'el ambiente',
  fecha_reserva: 'la fecha',
  hora_inicio_reserva: 'la hora de inicio',
  hora_fin_reserva: 'la hora de fin',
  motivo_reserva: 'el motivo',
}

// RF-03 y RF-04: solicitar una reserva. Cuatro grupos que siguen la pregunta que el usuario se hace (quién, dónde,
// cuándo y para qué): es su modelo mental de una reserva (Norman). La disponibilidad aparece dentro del grupo
// «¿Cuándo?», junto a las horas que la deciden, y si el horario está ocupado no se puede enviar (restricción).
// La API vuelve a revisar todo al registrar.
export function FormularioReserva({ alRegistrar }) {
  const { usuarioActual } = useUsuarioActual()
  const ambientes = useConsulta(() => listarAmbientes({ estado_ambiente: 'Disponible' }), [])
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeReserva,
    obligatorios: OBLIGATORIOS,
    alEnviar: async (datos) => {
      const respuesta = await registrarReserva(normalizarReserva(datos))
      alRegistrar(respuesta.data)
    },
  })
  const { valores, campo, enviar, aviso } = formulario
  const disponibilidad = useDisponibilidad(valores, horarioCompleto(valores))

  const lista = ambientes.datos ?? []
  const elegido = lista.find((ambiente) => ambiente.id_ambiente === valores.id_ambiente)
  const opcionesDeAmbiente = lista.map((ambiente) => ({
    valor: ambiente.id_ambiente,
    etiqueta: `${ambiente.nombre_ambiente} · ${TIPOS_AMBIENTE[ambiente.tipo_ambiente]}`,
  }))
  const bloqueado =
    disponibilidad.estado === 'ocupado' ? 'El horario elegido ya está ocupado: cambie la hora, la fecha o el ambiente.' : null

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <NotaObligatorios />
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}

      <GrupoDeCampos numero="1" titulo="¿Quién la solicita?" descripcion="La reserva queda a nombre de quien inició sesión.">
        <div className="rounded-lg border border-borde-fuerte bg-superficie-tenue px-3 py-2.5">
          <p className="font-semibold">{usuarioActual.nombre_completo_usuario}</p>
          <p className="text-sm text-texto-suave">
            {ROLES[usuarioActual.rol_usuario]} · {QUE_HACE_EL_ROL[usuarioActual.rol_usuario]}
          </p>
        </div>
      </GrupoDeCampos>

      <GrupoDeCampos numero="2" titulo="¿Qué ambiente necesita?" descripcion="Solo aparecen los ambientes disponibles.">
        <SelectInput
          {...campo('id_ambiente')}
          etiqueta="Ambiente"
          obligatorio
          ayuda={
            elegido
              ? `${elegido.capacidad_ambiente} personas · ${elegido.ubicacion_ambiente}` +
                (elegido.nombre_responsable_ambiente ? ` · responsable: ${elegido.nombre_responsable_ambiente}` : '')
              : 'Al elegirlo verá su capacidad y su ubicación.'
          }
          opciones={opcionesDeAmbiente}
          textoVacio={ambientes.cargando ? 'Cargando ambientes…' : 'Elija el ambiente'}
        />
      </GrupoDeCampos>

      <GrupoDeCampos numero="3" titulo="¿Cuándo?" descripcion="Entre las 07:00 y las 22:00, desde hoy.">
        <DateInput
          {...campo('fecha_reserva')}
          etiqueta="Fecha"
          obligatorio
          minimo={ahoraEnPeru().fecha}
          ayuda={valores.fecha_reserva ? formatearFechaLarga(valores.fecha_reserva) : 'Elija el día en el calendario.'}
        />
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
        <PanelDisponibilidad disponibilidad={disponibilidad} />
      </GrupoDeCampos>

      <GrupoDeCampos numero="4" titulo="¿Para qué?" descripcion="Ayuda al administrador a decidir.">
        <TextInput
          {...campo('motivo_reserva')}
          multilinea
          etiqueta="Motivo"
          obligatorio
          maximo={RESERVA.motivoMaximo}
          ayuda="Clase, práctica, reunión, evento…"
        />
      </GrupoDeCampos>

      <AccionesDeFormulario
        formulario={formulario}
        volverA="/"
        texto="Solicitar reserva"
        textoEnviando="Solicitando…"
        bloqueado={bloqueado}
      />
    </form>
  )
}
