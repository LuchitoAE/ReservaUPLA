import { useNavigate } from 'react-router'
import { registrarUsuario } from '../../api/usuariosApi'
import { useFormulario } from '../../hooks/useFormulario'
import { normalizarUsuario, reglasDeUsuario, USUARIO } from '../../reglas/usuario'
import { QUE_HACE_EL_ROL, ROLES } from '../../utils/formato'
import { ReglasDeContrasena } from '../autenticacion/ReglasDeContrasena'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { GrupoDeCampos } from '../ui/GrupoDeCampos'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { CampoDeContrasena } from '../ui/CampoDeContrasena'
import { GrupoDeOpciones } from '../ui/GrupoDeOpciones'
import { TextInput } from '../ui/TextInput'

const INICIALES = { codigo_usuario: '', nombre_completo_usuario: '', correo_usuario: '', rol_usuario: '', contrasena_usuario: '' }
const OBLIGATORIOS = {
  codigo_usuario: 'el código',
  nombre_completo_usuario: 'el nombre completo',
  correo_usuario: 'el correo',
  rol_usuario: 'el rol',
  contrasena_usuario: 'la contraseña inicial',
}
const OPCIONES_DE_ROL = Object.entries(ROLES).map(([valor, etiqueta]) => ({ valor, etiqueta, descripcion: QUE_HACE_EL_ROL[valor] }))

// RF-01: el administrador registra un usuario de cualquier rol. Tres grupos: quién es la persona, qué hará en el
// sistema y con qué contraseña entrará la primera vez (agrupación semántica).
// El rol se elige entre tarjetas que dicen qué permite cada uno (reconocer antes que recordar). Los ejemplos van como
// ayuda bajo el campo y no dentro de él: un texto de ejemplo dentro del campo parece un dato ya escrito.
export function FormularioUsuario() {
  const navegar = useNavigate()
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeUsuario,
    obligatorios: OBLIGATORIOS,
    alEnviar: async (valores) => {
      const respuesta = await registrarUsuario(normalizarUsuario(valores))
      navegar('/usuarios', { state: { aviso: respuesta.message } })
    },
  })
  const { valores, campo, enviar, aviso } = formulario

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <NotaObligatorios />
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}
      <GrupoDeCampos numero="1" titulo="Datos de la persona" descripcion="Con el código ingresará al sistema.">
        <TextInput
          {...campo('codigo_usuario')}
          etiqueta="Código"
          obligatorio
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          ayuda="El que le dio la universidad, por ejemplo P00914K."
        />
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
        <GrupoDeOpciones {...campo('rol_usuario')} etiqueta="Rol" obligatorio opciones={OPCIONES_DE_ROL} />
      </GrupoDeCampos>
      <GrupoDeCampos numero="3" titulo="Contraseña inicial" descripcion="Entréguela a la persona: con ella y su código ingresará.">
        <CampoDeContrasena {...campo('contrasena_usuario')} etiqueta="Contraseña inicial" obligatorio autoComplete="new-password" />
        <ReglasDeContrasena valor={valores.contrasena_usuario} />
      </GrupoDeCampos>
      <AccionesDeFormulario formulario={formulario} volverA="/usuarios" texto="Registrar usuario" textoEnviando="Registrando…" />
    </form>
  )
}
