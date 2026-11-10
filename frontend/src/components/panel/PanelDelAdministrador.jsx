import { listarReservas } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { ahoraEnPeru } from '../../utils/fechas'
import { Button } from '../ui/Button'
import { EstadoVacio } from '../ui/EstadoVacio'
import { Icono } from '../ui/Icono'
import { BandaDeBienvenida } from './BandaDeBienvenida'
import { IndicadoresDelPanel } from './IndicadoresDelPanel'
import { ListaDeReservas } from './ListaDeReservas'
import { proximasPrimero } from './ordenDeReservas'
import { resumenDelPanel } from './resumenDelPanel'
import { Seccion } from './Seccion'
import { UsoDeAmbientes } from './UsoDeAmbientes'

// Panel del administrador (RF-08 y RF-12, diseño AD01): todos los indicadores, las pendientes por aprobar (primero las
// más próximas) y cuántas reservas tiene cada ambiente.
export function PanelDelAdministrador({ usuario, indicadores }) {
  const hoy = ahoraEnPeru().fecha
  const pendientes = useConsulta(() => listarReservas({ estado_reserva: 'Pendiente', fecha_desde: hoy }), [])

  return (
    <>
      <BandaDeBienvenida
        resumen={resumenDelPanel({ rol: usuario.rol_usuario, nombre: usuario.nombre_completo_usuario, pendientes: indicadores.datos?.reservas_pendientes })}
        accion={
          <Button destino="/reservas" variante="blanco">
            <Icono nombre="reservas" />
            Ver todas las reservas
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <IndicadoresDelPanel rol={usuario.rol_usuario} consulta={indicadores} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Seccion
            id="por-aprobar"
            titulo="Pendientes por aprobar"
            descripcion="Primero las más próximas"
            icono="pendiente"
            enlace={{ destino: '/reservas?estado_reserva=Pendiente', texto: 'Ver todas' }}
          >
            {pendientes.cargando && !pendientes.datos ? (
              <p className="text-texto-suave">Cargando…</p>
            ) : (pendientes.datos ?? []).length === 0 ? (
              <EstadoVacio
                icono="aprobada"
                titulo="Todo al día"
                texto="No hay reservas pendientes. Cuando alguien solicite un ambiente, aparecerá aquí."
                accion={
                  <Button destino="/reservas" variante="secundario">
                    Ver todas las reservas
                  </Button>
                }
              />
            ) : (
              <ListaDeReservas
                reservas={proximasPrimero(pendientes.datos, 5, ahoraEnPeru())}
                vacio="No hay reservas esperando su aprobación."
                accion="Revisar"
                conSolicitante
              />
            )}
          </Seccion>
          <Seccion id="uso" titulo="Reservas por ambiente" descripcion="Todas las registradas, de más a menos" icono="total">
            {indicadores.datos && <UsoDeAmbientes usos={indicadores.datos.reservas_por_ambiente} />}
          </Seccion>
        </div>
      </div>
    </>
  )
}
