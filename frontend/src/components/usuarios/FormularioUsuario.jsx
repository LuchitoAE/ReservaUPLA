import { useState } from 'react'
import { useNavigate } from 'react-router'
import { registrarUsuario } from '../../api/usuariosApi'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { normalizarUsuario, USUARIO, validarCampoDeUsuario, validarUsuario } from '../../reglas/usuario'
import { soloErrores } from '../../reglas/validaciones'
import { avisoDeError } from '../../utils/avisoDeError'
import { opcionesDe, ROLES } from '../../utils/formato'
import { AlertMessage } from '../ui/AlertMessage'
import { Button } from '../ui/Button'
import { SelectInput } from '../ui/SelectInput'
import { TextInput } from '../ui/TextInput'

const INICIALES = { nombre_completo_usuario: '', correo_usuario: '', rol_usuario: '' }

// RF-01: registrar un usuario. Valida al salir de cada campo y al enviar; si la API rechaza algo, el mensaje
// aparece junto a su campo.
export function FormularioUsuario() {
  const [valores, setValores] = useState(INICIALES)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const navegar = useNavigate()
  const { recargarUsuarios } = useUsuarioActual()

  function cambiar(campo, valor) {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    // Si el campo ya mostraba un error, se vuelve a revisar mientras se corrige.
    if (errores[campo]) {
      setErrores(soloErrores({ ...errores, [campo]: validarCampoDeUsuario(campo, nuevos) }))
    }
  }

  function salir(campo) {
    setErrores(soloErrores({ ...errores, [campo]: validarCampoDeUsuario(campo, valores) }))
  }

  function enfocarPrimerError(encontrados) {
    const primero = Object.keys(encontrados)[0]
    document.getElementById(primero)?.focus()
  }

  async function enviar(evento) {
    evento.preventDefault()
    setAviso(null)
    const encontrados = validarUsuario(valores)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      enfocarPrimerError(encontrados)
      return
    }

    setEnviando(true)
    try {
      const respuesta = await registrarUsuario(normalizarUsuario(valores))
      recargarUsuarios()
      navegar('/usuarios', { state: { aviso: respuesta.message } })
    } catch (error) {
      if (Object.keys(error.errores ?? {}).length > 0) {
        setErrores(error.errores)
        enfocarPrimerError(error.errores)
      }
      setAviso(avisoDeError(error))
      setEnviando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5" aria-describedby="nota-obligatorios">
      <p id="nota-obligatorios" className="text-sm text-texto-suave">
        Los campos con <span className="text-error">*</span> son obligatorios.
      </p>
      {aviso && (
        <AlertMessage tipo="error" titulo={aviso.titulo} codigoRastreo={aviso.codigoRastreo}>
          {aviso.mensaje}
        </AlertMessage>
      )}
      <TextInput
        id="nombre_completo_usuario"
        etiqueta="Nombre completo"
        obligatorio
        autoComplete="name"
        maximo={USUARIO.nombreMaximo}
        ayuda="Nombres y apellidos, como en el documento de identidad."
        valor={valores.nombre_completo_usuario}
        error={errores.nombre_completo_usuario}
        onCambiar={(valor) => cambiar('nombre_completo_usuario', valor)}
        onSalir={() => salir('nombre_completo_usuario')}
      />
      <TextInput
        id="correo_usuario"
        type="email"
        etiqueta="Correo"
        obligatorio
        autoComplete="email"
        inputMode="email"
        maximo={USUARIO.correoMaximo}
        placeholder="nombre.apellido@upla.edu.pe"
        valor={valores.correo_usuario}
        error={errores.correo_usuario}
        onCambiar={(valor) => cambiar('correo_usuario', valor)}
        onSalir={() => salir('correo_usuario')}
      />
      <SelectInput
        id="rol_usuario"
        etiqueta="Rol"
        obligatorio
        ayuda="Solicitante: pide reservas. Administrador: las aprueba o rechaza. Responsable: consulta el uso de su ambiente."
        opciones={opcionesDe(ROLES)}
        textoVacio="Elija el rol"
        valor={valores.rol_usuario}
        error={errores.rol_usuario}
        onCambiar={(valor) => cambiar('rol_usuario', valor)}
        onSalir={() => salir('rol_usuario')}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button destino="/usuarios">Cancelar</Button>
        <Button type="submit" variante="principal" ocupado={enviando}>
          {enviando ? 'Registrando…' : 'Registrar usuario'}
        </Button>
      </div>
    </form>
  )
}
