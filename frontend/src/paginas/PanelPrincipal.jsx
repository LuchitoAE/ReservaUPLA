import { obtenerIndicadores } from '../api/panelApi'
import { UsoDeAmbientes } from '../components/panel/UsoDeAmbientes'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { Cargando } from '../components/ui/Cargando'
import { CardIndicador } from '../components/ui/CardIndicador'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { avisoDeError } from '../utils/avisoDeError'

// Cada indicador por estado lleva al listado filtrado por ese estado (todas las reservas, no solo las propias).
const listadoDe = (estado) => `/reservas?${new URLSearchParams({ ...(estado && { estado_reserva: estado }), todas: '1' })}`

const POR_ESTADO = [
  { estado: 'Pendiente', titulo: 'Reservas pendientes', clave: 'reservas_pendientes', descripcion: 'En espera de aprobación' },
  { estado: 'Aprobada', titulo: 'Reservas aprobadas', clave: 'reservas_aprobadas', descripcion: 'Ambiente ocupado en su horario' },
  { estado: 'Rechazada', titulo: 'Reservas rechazadas', clave: 'reservas_rechazadas', descripcion: 'No se pueden modificar' },
  { estado: 'Cancelada', titulo: 'Reservas canceladas', clave: 'reservas_canceladas', descripcion: 'Su horario quedó libre' },
]

// RF-08: dashboard con los indicadores básicos de reservas y el uso de cada ambiente.
export function PanelPrincipal() {
  const { usuarioActual } = useUsuarioActual()
  const { datos: indicadores, cargando, error } = useConsulta(() => obtenerIndicadores(), [])

  const masUtilizados = indicadores?.ambientes_mas_utilizados ?? []
  const totalDelMasUtilizado = masUtilizados[0]?.total_reservas ?? 0

  return (
    <>
      <EncabezadoDePagina
        titulo="Dashboard"
        conMigas={false}
        descripcion={
          usuarioActual
            ? `Hola, ${usuarioActual.nombre_completo_usuario.split(' ')[0]}. Este es el resumen de las reservas de ambientes.`
            : 'Resumen de las reservas de ambientes de la universidad.'
        }
        acciones={
          <Button destino="/reservas/nueva" variante="principal">
            Nueva reserva
          </Button>
        }
      />
      {error && <AlertMessage tipo="error" aviso={avisoDeError(error)} />}
      {cargando && !indicadores && <Cargando texto="Cargando indicadores…" />}
      {indicadores && (
        <div className="flex flex-col gap-6">
          <section aria-labelledby="titulo-indicadores">
            <h2 id="titulo-indicadores" className="sr-only">
              Indicadores
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <CardIndicador
                titulo="Total de reservas"
                valor={indicadores.total_reservas}
                descripcion="Registradas en el sistema"
                icono="total"
                destino={listadoDe(null)}
                accion="Ver todas"
              />
              {POR_ESTADO.map((indicador) => (
                <CardIndicador
                  key={indicador.estado}
                  titulo={indicador.titulo}
                  valor={indicadores[indicador.clave]}
                  descripcion={indicador.descripcion}
                  icono={indicador.estado.toLowerCase()}
                  tono={indicador.estado}
                  destino={listadoDe(indicador.estado)}
                />
              ))}
              <CardIndicador
                titulo="Ambiente más utilizado"
                valor={
                  masUtilizados.length > 0 ? (
                    <span className="block py-1 text-xl leading-snug">{masUtilizados.map((uso) => uso.nombre_ambiente).join(' y ')}</span>
                  ) : (
                    <span className="block py-1 text-xl leading-snug">—</span>
                  )
                }
                descripcion={
                  masUtilizados.length === 0
                    ? 'Aún no hay reservas'
                    : `${totalDelMasUtilizado} ${totalDelMasUtilizado === 1 ? 'reserva' : 'reservas'}${masUtilizados.length > 1 ? ' cada uno (empate)' : ''}`
                }
                icono="estrella"
              />
            </div>
          </section>
          <section aria-labelledby="titulo-uso" className="rounded-xl border border-borde bg-superficie p-5 sm:p-6">
            <h2 id="titulo-uso" className="mb-1 text-lg font-semibold text-titulo">
              Reservas por ambiente
            </h2>
            <p className="mb-4 text-sm text-texto-suave">Todas las reservas registradas de cada ambiente, de más a menos.</p>
            <UsoDeAmbientes usos={indicadores.reservas_por_ambiente} />
          </section>
        </div>
      )}
    </>
  )
}
