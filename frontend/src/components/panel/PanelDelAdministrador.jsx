import { useEffect } from 'react'
import { listarReservas } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { ahoraEnPeru } from '../../utils/fechas'
import { Button } from '../ui/Button'
import { EstadoVacio } from '../ui/EstadoVacio'
import { IndicadoresDelPanel } from './IndicadoresDelPanel'
import { ListaDeReservas } from './ListaDeReservas'
import { proximasPrimero } from './ordenDeReservas'
import { resumenDelPanel } from './resumenDelPanel'
import { useBandaDePagina } from '../../contexto/contextoBanda'
import { Seccion } from './Seccion'
import { UsoDeAmbientes } from './UsoDeAmbientes'

// Panel del administrador (RF-08 y RF-12, diseño AD01): todos los indicadores, las pendientes por aprobar (primero las
// más próximas) y cuántas reservas tiene cada ambiente.
export function PanelDelAdministrador({ usuario, indicadores }) {
  const hoy = ahoraEnPeru().fecha
  const pendientes = useConsulta(() => listarReservas({ estado_reserva: 'Pendiente', fecha_desde: hoy }), [])
  const { fijarBanda } = useBandaDePagina() ?? {}

  useEffect(() => {
    fijarBanda?.({
      descripcion: resumenDelPanel({
        rol: usuario.rol_usuario,
        nombre: usuario.nombre_completo_usuario,
        pendientes: indicadores.datos?.reservas_pendientes,
      }),
    })
    return () => fijarBanda?.(null)
  }, [fijarBanda, usuario.rol_usuario, usuario.nombre_completo_usuario, indicadores.datos])

  return (
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
  )
}
