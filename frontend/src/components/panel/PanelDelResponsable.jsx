import { useState } from 'react'
import { listarAmbientes } from '../../api/ambientesApi'
import { listarReservas } from '../../api/reservasApi'
import { useConsulta } from '../../hooks/useConsulta'
import { ahoraEnPeru } from '../../utils/fechas'
import { EncabezadoDePagina } from '../navegacion/EncabezadoDePagina'
import { Button } from '../ui/Button'
import { AgendaDeLaSemana } from './AgendaDeLaSemana'
import { diasDeLaSemana, lunesDe, moverSemana } from './agendaDeLaSemana'
import { IndicadoresDelPanel } from './IndicadoresDelPanel'
import { resumenDelPanel } from './resumenDelPanel'

const reservasDeLaSemana = (id_responsable, lunes) =>
  listarReservas({ id_responsable_ambiente: id_responsable, fecha_desde: lunes, fecha_hasta: diasDeLaSemana(lunes)[6] })

// Panel del responsable de ambiente (RF-12 y RF-13, diseño R01): los indicadores de sus ambientes y la agenda de la
// semana de cada uno. El saludo resume la semana actual, aunque la agenda muestre otra.
export function PanelDelResponsable({ usuario, indicadores }) {
  const lunesActual = lunesDe(ahoraEnPeru().fecha)
  const [lunes, setLunes] = useState(lunesActual)
  const ambientes = useConsulta(() => listarAmbientes({ id_responsable_ambiente: usuario.id_usuario }), [])
  const semana = useConsulta(() => reservasDeLaSemana(usuario.id_usuario, lunes), [lunes])
  const estaSemana = useConsulta(() => reservasDeLaSemana(usuario.id_usuario, lunesActual), [])

  const resumenDeEstaSemana = estaSemana.datos && {
    aprobadas: estaSemana.datos.filter((reserva) => reserva.estado_reserva === 'Aprobada').length,
    pendientes: estaSemana.datos.filter((reserva) => reserva.estado_reserva === 'Pendiente').length,
  }

  return (
    <>
      <EncabezadoDePagina
        titulo="Panel principal"
        conMigas={false}
        descripcion={resumenDelPanel({ rol: usuario.rol_usuario, nombre: usuario.nombre_completo_usuario, semana: resumenDeEstaSemana })}
        acciones={
          <Button destino="/reservas" variante="principal">
            Reservas de mis ambientes
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <IndicadoresDelPanel rol={usuario.rol_usuario} consulta={indicadores} ambientesACargo={ambientes.datos ?? []} />
        <AgendaDeLaSemana
          ambientes={ambientes.datos ?? []}
          reservas={semana.datos ?? []}
          lunes={lunes}
          cargando={(semana.cargando && !semana.datos) || (ambientes.cargando && !ambientes.datos)}
          alCambiarSemana={(semanas) => setLunes((actual) => moverSemana(actual, semanas))}
        />
      </div>
    </>
  )
}
