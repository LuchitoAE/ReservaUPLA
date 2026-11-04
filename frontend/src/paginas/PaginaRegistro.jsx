import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { MarcoDeAcceso } from '../components/autenticacion/MarcoDeAcceso'
import { ReglasDeContrasena } from '../components/autenticacion/ReglasDeContrasena'
import { AccionesDeFormulario } from '../components/ui/AccionesDeFormulario'
import { AlertMessage } from '../components/ui/AlertMessage'
import { GrupoDeCampos } from '../components/ui/GrupoDeCampos'
import { PasswordInput } from '../components/ui/PasswordInput'
import { TextInput } from '../components/ui/TextInput'
import { useFormulario } from '../hooks/useFormulario'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { reglasDeCuenta, USUARIO } from '../reglas/usuario'

const INICIALES = { nombre_completo_usuario: '', correo_usuario: '', contrasena_usuario: '', confirmacion_contrasena: '' }
const OBLIGATORIOS = {
  nombre_completo_usuario: 'el nombre completo',
  correo_usuario: 'el correo',
  contrasena_usuario: 'la contraseña',
  confirmacion_contrasena: 'la confirmación',
}

// RF-01: la persona crea su propia cuenta de solicitante. Dos grupos (quién es y su contraseña); las reglas de la
// contraseña se marcan mientras escribe y se pide repetirla para no equivocarse. Al terminar, entra al sistema.
export function PaginaRegistro() {
  const { usuarioActual, crearCuenta } = useUsuarioActual()
  const navegar = useNavigate()
  // Mientras se crea la cuenta, la sesión aparece antes de navegar: no hay que redirigir aún, o se pierde la bienvenida.
  const [creando, setCreando] = useState(false)
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeCuenta,
    obligatorios: OBLIGATORIOS,
    alEnviar: async (valores) => {
      setCreando(true)
      try {
        const respuesta = await crearCuenta(valores)
        navegar('/', { replace: true, state: { aviso: respuesta.message } })
      } catch (error) {
        setCreando(false)
        throw error
      }
    },
  })
  const { valores, campo, enviar, aviso } = formulario

  if (usuarioActual && !creando) {
    return <Navigate to="/" replace />
  }

  return (
    <MarcoDeAcceso
      titulo="Crear cuenta"
      tituloPestana="Crear cuenta"
      descripcion="Para solicitar reservas. Las cuentas de administrador y de responsable las crea el administrador."
    >
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {aviso && <AlertMessage tipo="error" aviso={aviso} />}
        <GrupoDeCampos numero="1" titulo="Sus datos" descripcion="Cómo se llama y su correo.">
          <TextInput
            {...campo('nombre_completo_usuario')}
            etiqueta="Nombre completo"
            obligatorio
            autoComplete="name"
            maximo={USUARIO.nombreMaximo}
          />
          <TextInput
            {...campo('correo_usuario')}
            type="email"
            etiqueta="Correo"
            obligatorio
            autoComplete="email"
            inputMode="email"
            ayuda="Por ejemplo, nombre.apellido@upla.edu.pe. Con él ingresará."
          />
        </GrupoDeCampos>
        <GrupoDeCampos numero="2" titulo="Contraseña" descripcion="La usará junto con su correo para ingresar.">
          <PasswordInput {...campo('contrasena_usuario')} etiqueta="Contraseña" obligatorio autoComplete="new-password" />
          <ReglasDeContrasena valor={valores.contrasena_usuario} />
          <PasswordInput {...campo('confirmacion_contrasena')} etiqueta="Repita la contraseña" obligatorio autoComplete="new-password" />
        </GrupoDeCampos>
        <AccionesDeFormulario formulario={formulario} volverA="/ingreso" texto="Crear cuenta" textoEnviando="Creando la cuenta…" />
      </form>
      <p className="mt-6 border-t border-borde pt-5 text-center text-texto-suave">
        ¿Ya tiene cuenta?{' '}
        <Link to="/ingreso" className="font-semibold text-enlace underline underline-offset-2 hover:decoration-2">
          Inicie sesión
        </Link>
      </p>
    </MarcoDeAcceso>
  )
}
