import { Navigate, useLocation, useNavigate } from 'react-router'
import { MarcoDeAcceso } from '../components/autenticacion/MarcoDeAcceso'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { CampoDeContrasena } from '../components/ui/CampoDeContrasena'
import { TextInput } from '../components/ui/TextInput'
import { useFormulario } from '../hooks/useFormulario'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { reglasDeIngreso } from '../reglas/usuario'

// Pantalla de ingreso (RF-09). Código antes que contraseña (modelo mental, Norman); «Ingresar» se habilita cuando
// los dos están escritos (restricción); si no coinciden, un solo mensaje que no dice cuál falló, en la línea bajo
// «Ingresar» (RNF-04, diseño AC03): la tarjeta va centrada y, si creciera, movería los campos. El mensaje con el que
// se llega (sesión cerrada o terminada) va arriba y no desaparece al escribir. No hay registro
// propio: el código lo entrega la universidad y la cuenta la crea el administrador (RN-07).
export function PaginaIngreso() {
  const { usuarioActual, iniciarSesion, transicionando } = useUsuarioActual()
  const { state } = useLocation()
  const navegar = useNavigate()
  const formulario = useFormulario({
    iniciales: { codigo_usuario: '', contrasena_usuario: '' },
    reglas: reglasDeIngreso,
    obligatorios: { codigo_usuario: 'el código', contrasena_usuario: 'la contraseña' },
    textoDeFallo: null,
    alEnviar: async (valores) => {
      await iniciarSesion(valores)
      navegar(state?.desde ?? '/', { replace: true })
    },
  })
  const { campo, enviar, resumenDeError, faltan, enviando } = formulario

  if (usuarioActual) {
    return <Navigate to={state?.desde ?? '/'} replace />
  }

  return (
    <MarcoDeAcceso titulo="Iniciar sesión" tituloPestana="Ingresar" descripcion="Ingrese con su código y su contraseña." saliendo={transicionando}>
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        {state?.aviso && <AlertMessage tipo="info" titulo={state.aviso} />}
        <TextInput
          {...campo('codigo_usuario')}
          etiqueta="Código"
          obligatorio
          icono="codigo"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          ayuda="Su código de la UPLA, por ejemplo P00914K."
        />
        <CampoDeContrasena {...campo('contrasena_usuario')} etiqueta="Contraseña" obligatorio />
        <div className="flex flex-col gap-2">
          <Button type="submit" variante="principal" ocupado={enviando} disabled={faltan.length > 0} aria-describedby="motivo-ingreso">
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
          <p
            id="motivo-ingreso"
            aria-live="polite"
            className={`min-h-10 text-center text-sm ${resumenDeError ? 'font-medium text-error' : 'text-texto-suave'}`}
          >
            {resumenDeError ? (
              <>
                <span aria-hidden="true">⚠ </span>
                {resumenDeError}
              </>
            ) : faltan.length > 0 ? (
              `Escriba ${faltan.join(' y ')} para ingresar.`
            ) : (
              'Listo para ingresar.'
            )}
          </p>
        </div>
      </form>
      <p className="mt-6 border-t border-borde pt-5 text-center text-texto-suave">Su código lo entrega la universidad.</p>
    </MarcoDeAcceso>
  )
}
