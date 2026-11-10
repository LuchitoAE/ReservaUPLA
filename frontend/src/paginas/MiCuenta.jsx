import { cambiarContrasena } from '../api/cuentaApi'
import { ReglasDeContrasena } from '../components/autenticacion/ReglasDeContrasena'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AccionesDeFormulario } from '../components/ui/AccionesDeFormulario'
import { AlertMessage } from '../components/ui/AlertMessage'
import { CampoDeContrasena } from '../components/ui/CampoDeContrasena'
import { Interruptor } from '../components/ui/Interruptor'
import { useAviso } from '../hooks/useAviso'
import { useFormulario } from '../hooks/useFormulario'
import { usePreferencias } from '../hooks/usePreferencias'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { normalizarCambioDeContrasena, reglasDeCambioDeContrasena } from '../reglas/usuario'
import { ROLES } from '../utils/formato'

const INICIALES = { contrasena_actual: '', contrasena_nueva: '', repetir_contrasena: '' }
const OBLIGATORIOS = {
  contrasena_actual: 'la contraseña actual',
  contrasena_nueva: 'la nueva',
  repetir_contrasena: 'su repetición',
}

// Mi cuenta (diseño S15 y S16): sus datos, que solo corrige el administrador; cambiar la contraseña (RF-11), con la
// actual y la nueva dos veces; y las preferencias de este navegador, por ahora el sonido de los avisos (RF-14). Al
// guardar la contraseña, la sesión sigue abierta y el formulario vuelve a empezar.
export function MiCuenta() {
  const { usuarioActual } = useUsuarioActual()
  const mostrarAviso = useAviso()
  const { sonidoEncendido, cambiarSonido } = usePreferencias()
  const formulario = useFormulario({
    iniciales: INICIALES,
    reglas: reglasDeCambioDeContrasena,
    obligatorios: OBLIGATORIOS,
    textoDeFallo: 'No se cambió',
    alEnviar: async (valores) => {
      await cambiarContrasena(normalizarCambioDeContrasena(valores))
      mostrarAviso({
        tipo: 'exito',
        titulo: 'Contraseña cambiada',
        texto: 'La sesión sigue abierta en este equipo. La próxima vez ingrese con la contraseña nueva.',
      })
      formulario.reiniciar()
    },
  })
  const { valores, campo, enviar } = formulario

  function alternarSonido(encendido) {
    cambiarSonido(encendido)
    mostrarAviso(
      encendido
        ? { tipo: 'exito', titulo: 'Sonido encendido', texto: 'Así sonará un aviso de algo que salió bien.' }
        : { tipo: 'info', titulo: 'Sonido apagado', texto: 'Los avisos seguirán apareciendo en pantalla.' },
    )
  }

  return (
    <>
      <EncabezadoDePagina titulo="Mi cuenta" descripcion="Sus datos, su contraseña y las preferencias de este navegador." />
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section aria-labelledby="titulo-datos" className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-5 sm:p-6 lg:self-start">
            <h2 id="titulo-datos" className="text-lg font-semibold text-titulo">
              Sus datos
            </h2>
            <div>
              <p className="text-lg font-semibold text-texto">{usuarioActual.nombre_completo_usuario}</p>
              <p className="text-sm font-semibold text-texto-suave">{ROLES[usuarioActual.rol_usuario]}</p>
            </div>
            <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2">
              <dt className="text-texto-suave">Código</dt>
              <dd className="font-semibold tabular-nums">{usuarioActual.codigo_usuario}</dd>
              <dt className="text-texto-suave">Correo</dt>
              <dd className="min-w-0 break-words">{usuarioActual.correo_usuario}</dd>
              <dt className="text-texto-suave">Estado</dt>
              <dd>{usuarioActual.activo_usuario ? 'Cuenta activa' : 'Cuenta inactiva'}</dd>
            </dl>
            <AlertMessage tipo="info" titulo="¿Datos incorrectos?" anunciar={false}>
              <p className="text-sm">El código, el nombre y el correo los corrige el administrador.</p>
            </AlertMessage>
          </section>

          <section aria-labelledby="titulo-contrasena" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
            <h2 id="titulo-contrasena" className="text-lg font-semibold text-titulo">
              Cambiar contraseña
            </h2>
            <p className="mb-4 text-sm text-texto-suave">Elija una que no use en otros sitios.</p>
            <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
              <CampoDeContrasena {...campo('contrasena_actual')} etiqueta="Contraseña actual" obligatorio autoComplete="current-password" />
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoDeContrasena {...campo('contrasena_nueva')} etiqueta="Nueva contraseña" obligatorio autoComplete="new-password" />
                <CampoDeContrasena
                  {...campo('repetir_contrasena')}
                  etiqueta="Repita la nueva contraseña"
                  obligatorio
                  autoComplete="new-password"
                />
              </div>
              <ReglasDeContrasena valor={valores.contrasena_nueva} id="reglas-contrasena-nueva" />
              <AccionesDeFormulario formulario={formulario} volverA="/" texto="Guardar contraseña" textoEnviando="Guardando…" />
            </form>
          </section>
        </div>

        <section aria-labelledby="titulo-preferencias" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
          <h2 id="titulo-preferencias" className="text-lg font-semibold text-titulo">
            Preferencias
          </h2>
          <p className="mb-4 text-sm text-texto-suave">Se guardan en este navegador.</p>
          <Interruptor
            id="sonido-de-los-avisos"
            etiqueta="Sonido de los avisos"
            descripcion="Un sonido corto cuando termina una acción: uno para lo que salió bien y otro para un rechazo, una cancelación o un error al enviar. El aviso en pantalla aparece siempre."
            activo={sonidoEncendido}
            onCambiar={alternarSonido}
          />
        </section>
      </div>
    </>
  )
}
