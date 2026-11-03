import { useNavigate } from 'react-router'
import { registrarUsuario } from '../../api/usuariosApi'
import { useFormulario } from '../../hooks/useFormulario'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { normalizarUsuario, reglasDeUsuario, USUARIO } from '../../reglas/usuario'
import { opcionesDe, ROLES } from '../../utils/formato'
import { AccionesDeFormulario } from '../ui/AccionesDeFormulario'
import { AlertMessage } from '../ui/AlertMessage'
import { NotaObligatorios } from '../ui/NotaObligatorios'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'

const INICIALES = { nombre_completo_usuario: '', correo_usuario: '', rol_usuario: '' }

// RF-01: registrar un usuario. El estado y el envío los maneja useFormulario; aquí solo van los campos.
export function FormularioUsuario() {
  const navegar = useNavigate()
  const { recargarUsuarios } = useUsuarioActual()
  const { campo, enviar, enviando, aviso } = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeUsuario,
    alEnviar: async (valores) => {
      const respuesta = await registrarUsuario(normalizarUsuario(valores))
      recargarUsuarios()
      navegar('/usuarios', { state: { aviso: respuesta.message } })
    },
  })

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <NotaObligatorios />
      {aviso && <AlertMessage tipo="error" aviso={aviso} />}
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
        placeholder="nombre.apellido@upla.edu.pe"
      />
      <SelectInput
        {...campo('rol_usuario')}
        etiqueta="Rol"
        obligatorio
        ayuda="Solicitante: pide reservas. Administrador: las aprueba o rechaza. Responsable: consulta el uso de su ambiente."
        opciones={opcionesDe(ROLES)}
        textoVacio="Elija el rol"
      />
      <AccionesDeFormulario volverA="/usuarios" enviando={enviando} texto="Registrar usuario" textoEnviando="Registrando…" />
    </form>
  )
}
