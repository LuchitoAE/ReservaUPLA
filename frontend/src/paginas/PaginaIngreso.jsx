import { Navigate, useLocation, useNavigate } from 'react-router'
import { MarcoDeAcceso } from '../components/autenticacion/MarcoDeAcceso'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { PasswordInput } from '../components/ui/PasswordInput'
import { TextInput } from '../components/ui/TextInput'
import { useFormulario } from '../hooks/useFormulario'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { reglasDeIngreso } from '../reglas/usuario'

// Pantalla de ingreso (RF-09). Código antes que contraseña (modelo mental, Norman); «Ingresar» se habilita cuando
// los dos están escritos (restricción); si no coinciden, un solo mensaje que no dice cuál falló. No hay registro
// propio: el código lo entrega la universidad y la cuenta la crea el administrador (RN-07).
export function PaginaIngreso() {
  const { usuarioActual, iniciarSesion } = useUsuarioActual()
  const { state } = useLocation()
  const navegar = useNavigate()
  const formulario = useFormulario({
    iniciales: { codigo_usuario: '', contrasena_usuario: '' },
    reglas: reglasDeIngreso,
    obligatorios: { codigo_usuario: 'el código', contrasena_usuario: 'la contraseña' },
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
    <MarcoDeAcceso titulo="Iniciar sesión" tituloPestana="Ingresar" descripcion="Ingrese con su código y su contraseña.">
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {state?.aviso && !aviso && <AlertMessage tipo="info" titulo={state.aviso} />}
        {aviso && <AlertMessage tipo="error" aviso={aviso} />}
        <TextInput
          {...campo('codigo_usuario')}
          etiqueta="Código"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          ayuda="Su código de la UPLA, por ejemplo P00914K."
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
      <p className="mt-6 border-t border-borde pt-5 text-center text-texto-suave">Su código lo entrega la universidad.</p>
    </MarcoDeAcceso>
  )
}
