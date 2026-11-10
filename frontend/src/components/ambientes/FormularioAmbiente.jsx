import { useNavigate } from 'react-router'
import { registrarAmbiente } from '../../api/ambientesApi'
import { listarUsuarios } from '../../api/usuariosApi'
import { useConsulta } from '../../hooks/useConsulta'
import { useAviso } from '../../hooks/useAviso'
import { useFormulario } from '../../hooks/useFormulario'
import { AMBIENTE, normalizarAmbiente, reglasDeAmbiente } from '../../reglas/ambiente'
import { ESTADOS_AMBIENTE, opcionesDe, TIPOS_AMBIENTE } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { GrupoDeCampos } from '../ui/GrupoDeCampos'
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
const OBLIGATORIOS = {
  nombre_ambiente: 'el nombre',
  tipo_ambiente: 'el tipo',
  capacidad_ambiente: 'la capacidad',
  ubicacion_ambiente: 'la ubicación',
  estado_ambiente: 'el estado',
}

// RF-02: registrar un ambiente, en tres grupos: qué es, cuánto cabe y dónde está, y si se puede usar y quién lo
// supervisa (agrupación semántica). El estado empieza en «Disponible», el valor más común.
export function FormularioAmbiente() {
  const navegar = useNavigate()
  const mostrarAviso = useAviso()
  const responsables = useConsulta(() => listarUsuarios({ rol_usuario: 'ResponsableDeAmbiente', activo_usuario: true }), [])
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeAmbiente,
    obligatorios: OBLIGATORIOS,
    alEnviar: async (valores) => {
      const { data: ambiente } = await registrarAmbiente(normalizarAmbiente(valores))
      mostrarAviso({ tipo: 'exito', titulo: 'Ambiente registrado', texto: `${ambiente.nombre_ambiente} ya está en la lista, marcado como nuevo.` })
      navegar('/ambientes', { state: { nuevo: ambiente.id_ambiente } })
    },
  })
  const { campo, enviar } = formulario

  const opcionesDeResponsable = (responsables.datos ?? []).map((usuario) => ({
    valor: usuario.id_usuario,
    etiqueta: usuario.nombre_completo_usuario,
  }))

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <GrupoDeCampos numero="1" columnas={2} titulo="Identificación" descripcion="Cómo se llama y qué clase de ambiente es.">
        <TextInput
          {...campo('nombre_ambiente')}
          etiqueta="Nombre"
          obligatorio
          maximo={AMBIENTE.nombreMaximo}
          ayuda="Por ejemplo, Laboratorio de cómputo 1."
        />
        <SelectInput
          {...campo('tipo_ambiente')}
          etiqueta="Tipo"
          obligatorio
          opciones={opcionesDe(TIPOS_AMBIENTE)}
          textoVacio="Elija el tipo"
        />
      </GrupoDeCampos>
      <GrupoDeCampos numero="2" columnas={2} titulo="Capacidad y ubicación" descripcion="Cuántas personas caben y dónde encontrarlo.">
        <TextInput
          {...campo('capacidad_ambiente')}
          type="number"
          inputMode="numeric"
          min={AMBIENTE.capacidadMinima}
          max={AMBIENTE.capacidadMaxima}
          etiqueta="Capacidad"
          obligatorio
          ayuda={`Personas que caben sentadas, de ${AMBIENTE.capacidadMinima} a ${AMBIENTE.capacidadMaxima}.`}
        />
        <TextInput
          {...campo('ubicacion_ambiente')}
          etiqueta="Ubicación"
          obligatorio
          maximo={AMBIENTE.ubicacionMaximo}
          ayuda="Pabellón y piso, por ejemplo: Pabellón B, segundo piso."
        />
      </GrupoDeCampos>
      <GrupoDeCampos numero="3" columnas={2} titulo="Estado y responsable" descripcion="Si recibe reservas y quién consulta su uso.">
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
              : 'Solo aparecen los usuarios con el rol Responsable de ambiente.'
          }
          opciones={opcionesDeResponsable}
          textoVacio="Sin responsable"
          opcional
        />
      </GrupoDeCampos>
      <AccionesDeFormulario formulario={formulario} volverA="/ambientes" texto="Registrar ambiente" textoEnviando="Registrando…" />
    </form>
  )
}
