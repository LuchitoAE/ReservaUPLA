import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { MarcoDeAcceso } from '../components/autenticacion/MarcoDeAcceso'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { PasswordInput } from '../components/ui/PasswordInput'
import { TextInput } from '../components/ui/TextInput'
import { useFormulario } from '../hooks/useFormulario'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { reglasDeIngreso } from '../reglas/usuario'

// Pantalla de ingreso. Correo antes que contraseña (modelo mental, Norman); «Ingresar» se habilita cuando los dos
// están escritos (restricción); si no coinciden, un solo mensaje que no dice cuál falló. Quien no tiene cuenta ve
// el camino para crearla.
export function PaginaIngreso() {
  const { usuarioActual, iniciarSesion } = useUsuarioActual()
  const { state } = useLocation()
  const navegar = useNavigate()
  const formulario = useFormulario({
    iniciales: { correo_usuario: '', contrasena_usuario: '' },
    reglas: reglasDeIngreso,
    obligatorios: { correo_usuario: 'el correo', contrasena_usuario: 'la contraseña' },
    alEnviar: async (valores) => {
      await iniciarSesion(valores)
      navegar(state?.desde ?? '/', { replace: true })
    },
  })
  const { campo, enviar, aviso, faltan, enviando } = formulario

  if (usuarioActual) {
    return <Navigate to={state?.desde ?? '/'} replace />
  }

  return (
    <MarcoDeAcceso titulo="Iniciar sesión" tituloPestana="Ingresar" descripcion="Ingrese con su correo y su contraseña.">
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {state?.aviso && !aviso && <AlertMessage tipo="info" titulo={state.aviso} />}
        {aviso && <AlertMessage tipo="error" aviso={aviso} />}
        <TextInput
          {...campo('correo_usuario')}
          type="email"
          etiqueta="Correo"
          autoComplete="username"
          inputMode="email"
          ayuda="Por ejemplo, nombre.apellido@upla.edu.pe."
        />
        <PasswordInput {...campo('contrasena_usuario')} etiqueta="Contraseña" />
        <div className="flex flex-col gap-2">
          <Button type="submit" variante="principal" ocupado={enviando} disabled={faltan.length > 0} aria-describedby="motivo-ingreso">
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
          <p id="motivo-ingreso" aria-live="polite" className="text-center text-sm text-texto-suave">
            {faltan.length > 0 ? `Escriba ${faltan.join(' y ')} para ingresar.` : 'Listo para ingresar.'}
          </p>
        </div>
      </form>
      <p className="mt-6 border-t border-borde pt-5 text-center text-texto-suave">
        ¿Es su primera vez?{' '}
        <Link to="/registro" className="font-semibold text-enlace underline underline-offset-2 hover:decoration-2">
          Cree su cuenta de solicitante
        </Link>
      </p>
    </MarcoDeAcceso>
  )
}
