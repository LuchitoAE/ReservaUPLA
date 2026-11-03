import { useNavigate } from 'react-router'
import { registrarAmbiente } from '../../api/ambientesApi'
import { listarUsuarios } from '../../api/usuariosApi'
import { useConsulta } from '../../hooks/useConsulta'
import { useFormulario } from '../../hooks/useFormulario'
import { AMBIENTE, normalizarAmbiente, reglasDeAmbiente } from '../../reglas/ambiente'
import { ESTADOS_AMBIENTE, opcionesDe, TIPOS_AMBIENTE } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'

const INICIALES = {
  nombre_ambiente: '',
  tipo_ambiente: '',
  capacidad_ambiente: '',
  ubicacion_ambiente: '',
  estado_ambiente: 'Disponible',
  id_responsable_ambiente: '',
}

// RF-02: registrar un ambiente. Reutiliza useFormulario y los mismos campos que el formulario de usuarios.
export function FormularioAmbiente() {
  const navegar = useNavigate()
  const responsables = useConsulta(() => listarUsuarios({ rol_usuario: 'ResponsableDeAmbiente', activo_usuario: true }), [])
  const { campo, enviar, enviando, aviso } = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeAmbiente,
    alEnviar: async (valores) => {
      const respuesta = await registrarAmbiente(normalizarAmbiente(valores))
      navegar('/ambientes', { state: { aviso: respuesta.message } })
    },
  })

  const opcionesDeResponsable = (responsables.datos ?? []).map((usuario) => ({
    valor: usuario.id_usuario,
    etiqueta: usuario.nombre_completo_usuario,
  }))

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <NotaObligatorios />
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}
      <TextInput
        {...campo('nombre_ambiente')}
        etiqueta="Nombre"
        obligatorio
        maximo={AMBIENTE.nombreMaximo}
        placeholder="Laboratorio de cómputo 1"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectInput
          {...campo('tipo_ambiente')}
          etiqueta="Tipo"
          obligatorio
          opciones={opcionesDe(TIPOS_AMBIENTE)}
          textoVacio="Elija el tipo"
        />
        <TextInput
          {...campo('capacidad_ambiente')}
          type="number"
          inputMode="numeric"
          min={AMBIENTE.capacidadMinima}
          max={AMBIENTE.capacidadMaxima}
          etiqueta="Capacidad"
          obligatorio
          ayuda="Personas que caben sentadas."
        />
      </div>
      <TextInput
        {...campo('ubicacion_ambiente')}
        etiqueta="Ubicación"
        obligatorio
        maximo={AMBIENTE.ubicacionMaximo}
        placeholder="Pabellón B, segundo piso"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectInput
          {...campo('estado_ambiente')}
          etiqueta="Estado"
          obligatorio
          ayuda="Solo un ambiente disponible recibe reservas."
          opciones={opcionesDe(ESTADOS_AMBIENTE)}
        />
        <SelectInput
          {...campo('id_responsable_ambiente')}
          etiqueta="Responsable (opcional)"
          ayuda={
            opcionesDeResponsable.length === 0
              ? 'Aún no hay usuarios con el rol «Responsable de ambiente».'
              : 'Quien consulta el uso del ambiente.'
          }
          opciones={opcionesDeResponsable}
          textoVacio="Sin responsable"
          opcional
        />
      </div>
      <AccionesDeFormulario volverA="/ambientes" enviando={enviando} texto="Registrar ambiente" textoEnviando="Registrando…" />
    </form>
  )
}
