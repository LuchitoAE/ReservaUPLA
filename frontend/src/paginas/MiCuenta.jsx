import { cambiarContrasena } from '../api/cuentaApi'
import { ReglasDeContrasena } from '../components/autenticacion/ReglasDeContrasena'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AccionesDeFormulario } from '../components/ui/AccionesDeFormulario'
import { AlertMessage } from '../components/ui/AlertMessage'
import { CampoDeContrasena } from '../components/ui/CampoDeContrasena'
import { Icono } from '../components/ui/Icono'
import { Interruptor } from '../components/ui/Interruptor'
import { useAviso } from '../hooks/useAviso'
import { useFormulario } from '../hooks/useFormulario'
import { usePreferencias } from '../hooks/usePreferencias'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { normalizarCambioDeContrasena, reglasDeCambioDeContrasena } from '../reglas/usuario'
import { inicialesDe, ROLES } from '../utils/formato'

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
            <div className="flex items-center gap-2">
              <Icono nombre="persona" className="size-5 text-foco" />
              <h2 id="titulo-datos" className="text-lg font-semibold text-titulo">
                Sus datos
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-acento text-xl font-bold text-acento-texto"
              >
                {inicialesDe(usuarioActual.nombre_completo_usuario)}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-texto">{usuarioActual.nombre_completo_usuario}</p>
                <span className="mt-1 inline-flex rounded-full bg-info-fondo px-2.5 py-0.5 text-xs font-semibold text-info-texto">
                  {ROLES[usuarioActual.rol_usuario]}
                </span>
              </div>
            </div>
            <dl className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icono nombre="codigo" className="size-4 text-texto-suave" />
                <dt className="w-16 shrink-0 text-texto-suave">Código</dt>
                <dd className="font-semibold tabular-nums">{usuarioActual.codigo_usuario}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Icono nombre="correo" className="size-4 text-texto-suave" />
                <dt className="w-16 shrink-0 text-texto-suave">Correo</dt>
                <dd className="min-w-0 break-words">{usuarioActual.correo_usuario}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Icono nombre="aprobada" className="size-4 text-texto-suave" />
                <dt className="w-16 shrink-0 text-texto-suave">Estado</dt>
                <dd>{usuarioActual.activo_usuario ? 'Cuenta activa' : 'Cuenta inactiva'}</dd>
              </div>
            </dl>
            <AlertMessage tipo="info" titulo="¿Datos incorrectos?" anunciar={false}>
              <p className="text-sm">El código, el nombre y el correo los corrige el administrador.</p>
            </AlertMessage>
          </section>

          <section aria-labelledby="titulo-contrasena" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Icono nombre="llave" className="size-5 text-foco" />
              <h2 id="titulo-contrasena" className="text-lg font-semibold text-titulo">
                Cambiar contraseña
              </h2>
            </div>
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
              <AccionesDeFormulario
                formulario={formulario}
                volverA="/"
                texto="Guardar contraseña"
                textoEnviando="Guardando…"
                icono="aprobada"
              />
              <p className="border-t border-borde pt-4 text-sm text-texto-suave">
                Al guardar, la sesión sigue abierta en este equipo. La próxima vez ingrese con la contraseña nueva.
              </p>
            </form>
          </section>
        </div>

        <section aria-labelledby="titulo-preferencias" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Icono nombre="altavoz" className="size-5 text-foco" />
            <h2 id="titulo-preferencias" className="text-lg font-semibold text-titulo">
              Preferencias
            </h2>
          </div>
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
