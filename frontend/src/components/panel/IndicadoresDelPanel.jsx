import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from '../ui/AlertMessage'
import { Cargando } from '../ui/Cargando'
import { CardIndicador } from '../ui/CardIndicador'

// Cómo se llama el total y la sexta tarjeta para cada rol (diseños S01, R01 y AD01): cada uno cuenta lo suyo (RF-12).
const TOTAL = {
  Solicitante: { titulo: 'Mis reservas', descripcion: 'Todas las que registré' },
  ResponsableDeAmbiente: { titulo: 'En sus ambientes', descripcion: 'Registradas en los ambientes a su cargo' },
  Administrador: { titulo: 'Total de reservas', descripcion: 'Registradas en el sistema' },
}

const POR_ESTADO = [
  { estado: 'Pendiente', titulo: 'Pendientes', clave: 'reservas_pendientes', descripcion: 'En espera de aprobación' },
  { estado: 'Aprobada', titulo: 'Aprobadas', clave: 'reservas_aprobadas', descripcion: 'Ambiente ocupado en su horario' },
  { estado: 'Rechazada', titulo: 'Rechazadas', clave: 'reservas_rechazadas', descripcion: 'No se pueden modificar' },
  { estado: 'Cancelada', titulo: 'Canceladas', clave: 'reservas_canceladas', descripcion: 'Su horario quedó libre' },
]

// El listado ya se abre con lo que le toca a cada rol: el enlace solo agrega el estado.
const listadoDe = (estado) => (estado ? `/reservas?${new URLSearchParams({ estado_reserva: estado })}` : '/reservas')

const reservas = (n) => `${n} ${n === 1 ? 'reserva' : 'reservas'}`

// RF-08 y RF-12: los indicadores del panel principal. El total, uno por estado (con el semáforo) y una sexta tarjeta:
// el ambiente que más usa el solicitante, los ambientes a cargo del responsable o el más utilizado de todos.
//   consulta: lo que devuelve useConsulta al pedir los indicadores. ambientesACargo: solo para el responsable.
export function IndicadoresDelPanel({ rol, consulta, ambientesACargo = [] }) {
  if (consulta.error) {
    return <AlertMessage tipo="error" aviso={avisoDeError(consulta.error)} />
  }
  if (!consulta.datos) {
    return <Cargando texto="Cargando indicadores…" />
  }

  const indicadores = consulta.datos
  const masUtilizados = indicadores.ambientes_mas_utilizados
  const total = TOTAL[rol] ?? TOTAL.Administrador

  return (
    <section aria-labelledby="titulo-indicadores">
      <h2 id="titulo-indicadores" className="sr-only">
        Indicadores
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <CardIndicador
          titulo={total.titulo}
          valor={indicadores.total_reservas}
          descripcion={total.descripcion}
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
        {rol === 'ResponsableDeAmbiente' ? (
          <CardIndicador
            titulo="A su cargo"
            valor={<span className="block py-1 text-xl leading-snug">{`${ambientesACargo.length} ${ambientesACargo.length === 1 ? 'ambiente' : 'ambientes'}`}</span>}
            descripcion={(() => {
              const fuera = ambientesACargo.filter((ambiente) => ambiente.estado_ambiente !== 'Disponible').length
              return fuera === 0 ? 'Todos disponibles' : `${fuera} no ${fuera === 1 ? 'disponible' : 'disponibles'} ahora`
            })()}
            icono="ambientes"
          />
        ) : (
          <CardIndicador
            titulo={rol === 'Solicitante' ? 'El que más usa' : 'Ambiente más utilizado'}
            valor={
              <span className="block py-1 text-xl leading-snug">
                {masUtilizados.length > 0 ? masUtilizados.map((uso) => uso.nombre_ambiente).join(' y ') : '—'}
              </span>
            }
            descripcion={
              masUtilizados.length === 0
                ? 'Aún no hay reservas'
                : `${reservas(masUtilizados[0].total_reservas)}${masUtilizados.length > 1 ? ' cada uno (empate)' : ''}`
            }
            icono="estrella"
          />
        )}
      </div>
    </section>
  )
}
