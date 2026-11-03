import { useNavigate } from 'react-router'
import { registrarUsuario } from '../../api/usuariosApi'
import { useFormulario } from '../../hooks/useFormulario'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { normalizarUsuario, reglasDeUsuario, USUARIO } from '../../reglas/usuario'
import { QUE_HACE_EL_ROL, ROLES } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { GrupoDeCampos } from '../ui/GrupoDeCampos'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { RadioInput } from '../ui/RadioInput'
import { TextInput } from '../ui/TextInput'

const INICIALES = { nombre_completo_usuario: '', correo_usuario: '', rol_usuario: '' }
const OBLIGATORIOS = { nombre_completo_usuario: 'el nombre completo', correo_usuario: 'el correo', rol_usuario: 'el rol' }
const OPCIONES_DE_ROL = Object.entries(ROLES).map(([valor, etiqueta]) => ({ valor, etiqueta, descripcion: QUE_HACE_EL_ROL[valor] }))

// RF-01: registrar un usuario. Dos grupos: quién es la persona y qué hará en el sistema (agrupación semántica).
// El rol se elige entre tarjetas que dicen qué permite cada uno (reconocer antes que recordar). Los ejemplos van como
// ayuda bajo el campo y no dentro de él: un texto de ejemplo dentro del campo parece un dato ya escrito.
export function FormularioUsuario() {
  const navegar = useNavigate()
  const { recargarUsuarios } = useUsuarioActual()
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeUsuario,
    obligatorios: OBLIGATORIOS,
    alEnviar: async (valores) => {
      const respuesta = await registrarUsuario(normalizarUsuario(valores))
      recargarUsuarios()
      navegar('/usuarios', { state: { aviso: respuesta.message } })
    },
  })
  const { campo, enviar, aviso } = formulario

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <NotaObligatorios />
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}
      <GrupoDeCampos numero="1" titulo="Datos de la persona" descripcion="Cómo se llama y cómo contactarla.">
        <TextInput
          {...campo('nombre_completo_usuario')}
          etiqueta="Nombre completo"
          obligatorio
          autoComplete="name"
          maximo={USUARIO.nombreMaximo}
          ayuda="Nombres y apellidos, como en el documento de identidad."
        />
        <TextInput
          {...campo('correo_usuario')}
          type="email"
          etiqueta="Correo"
          obligatorio
          autoComplete="email"
          inputMode="email"
          maximo={USUARIO.correoMaximo}
          ayuda="Por ejemplo, nombre.apellido@upla.edu.pe."
        />
      </GrupoDeCampos>
      <GrupoDeCampos numero="2" titulo="Rol en el sistema" descripcion="Decide qué podrá hacer con las reservas.">
        <RadioInput {...campo('rol_usuario')} etiqueta="Rol" obligatorio opciones={OPCIONES_DE_ROL} />
      </GrupoDeCampos>
      <AccionesDeFormulario formulario={formulario} volverA="/usuarios" texto="Registrar usuario" textoEnviando="Registrando…" />
    </form>
  )
}
