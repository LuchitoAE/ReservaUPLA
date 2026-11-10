import { listarAmbientes } from '../../api/ambientesApi'
import { listarReservas } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { ahoraEnPeru } from '../../utils/fechas'
import { Button } from '../ui/Button'
import { Icono } from '../ui/Icono'
import { BandaDeBienvenida } from './BandaDeBienvenida'
import { IndicadoresDelPanel } from './IndicadoresDelPanel'
import { ListaDeAmbientes } from './ListaDeAmbientes'
import { ListaDeReservas } from './ListaDeReservas'
import { proximasPrimero } from './ordenDeReservas'
import { resumenDelPanel } from './resumenDelPanel'
import { Seccion } from './Seccion'

const PASOS = [
  { icono: 'nueva', titulo: '1. Usted la registra', texto: 'El sistema revisa que el horario esté libre.', estilo: 'bg-info-fondo text-info' },
  { icono: 'pendiente', titulo: '2. Queda pendiente', texto: 'El administrador la revisa.', estilo: 'bg-pendiente-fondo text-pendiente-texto' },
  { icono: 'aprobada', titulo: '3. Aprobada o rechazada', texto: 'Verá el cambio de estado en el detalle.', estilo: 'bg-aprobada-fondo text-aprobada-texto' },
]

// Panel del solicitante (RF-12, diseño S01): sus indicadores, sus próximas reservas, cómo avanza una reserva y los
// ambientes que puede pedir.
export function PanelDelSolicitante({ usuario, indicadores }) {
  const hoy = ahoraEnPeru().fecha
  const proximas = useConsulta(() => listarReservas({ id_usuario: usuario.id_usuario, fecha_desde: hoy }), [])
  const ambientes = useConsulta(() => listarAmbientes(), [])

  return (
    <>
      <BandaDeBienvenida
        resumen={resumenDelPanel({ rol: usuario.rol_usuario, nombre: usuario.nombre_completo_usuario, pendientes: indicadores.datos?.reservas_pendientes })}
        accion={
          <Button destino="/reservas" variante="blanco">
            <Icono nombre="reservas" />
            Ver mis reservas
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <IndicadoresDelPanel rol={usuario.rol_usuario} consulta={indicadores} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Seccion id="proximas" titulo="Mis próximas reservas" descripcion="Ordenadas por fecha" enlace={{ destino: '/reservas', texto: 'Ver todas' }}>
            {proximas.cargando && !proximas.datos ? (
              <p className="text-texto-suave">Cargando…</p>
            ) : (
              <ListaDeReservas reservas={proximasPrimero(proximas.datos ?? [], 5, ahoraEnPeru())} vacio="No tiene reservas próximas." />
            )}
          </Seccion>
          <div className="flex flex-col gap-6">
            <Seccion id="como-avanza" titulo="Cómo avanza una reserva">
              <ol className="flex flex-col gap-3">
                {PASOS.map((paso) => (
                  <li key={paso.titulo} className="flex gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${paso.estilo}`}>
                      <Icono nombre={paso.icono} />
                    </span>
                    <span>
                      <span className="block font-semibold text-texto">{paso.titulo}</span>
                      <span className="block text-sm text-texto-suave">{paso.texto}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Seccion>
            <Seccion id="ambientes" titulo="Ambientes" enlace={{ destino: '/ambientes', texto: 'Ver' }}>
              <ListaDeAmbientes ambientes={ambientes.datos ?? []} />
            </Seccion>
          </div>
        </div>
      </div>
    </>
  )
}
