import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from '../ui/AlertMessage'
import { Cargando } from '../ui/Cargando'
import { CardIndicador } from '../ui/CardIndicador'

// Cómo se llama el total y la sexta tarjeta para cada rol (diseños S01, R01 y AD01): cada uno cuenta lo suyo (RF-12).
const TOTAL = {
  Solicitante: 'Mis reservas',
  ResponsableDeAmbiente: 'En sus ambientes',
  Administrador: 'Total de reservas',
}

const POR_ESTADO = [
  { estado: 'Pendiente', titulo: 'Pendientes', clave: 'reservas_pendientes' },
  { estado: 'Aprobada', titulo: 'Aprobadas', clave: 'reservas_aprobadas' },
  { estado: 'Rechazada', titulo: 'Rechazadas', clave: 'reservas_rechazadas' },
  { estado: 'Cancelada', titulo: 'Canceladas', clave: 'reservas_canceladas' },
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
  const fuera = ambientesACargo.filter((ambiente) => ambiente.estado_ambiente !== 'Disponible').length

  return (
    <section aria-labelledby="titulo-indicadores">
      <h2 id="titulo-indicadores" className="sr-only">
        Indicadores
      </h2>
      {/* Seis en una fila, como el diseño (AD01, S01, R01): solo cuando cada tarjeta conserva el ancho del diseño
          (unos 170 px). Con menos espacio se reparten en tres por fila para que los nombres no se partan. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 3xl:grid-cols-6">
        <CardIndicador
          titulo={TOTAL[rol] ?? TOTAL.Administrador}
          valor={indicadores.total_reservas}
          icono="total"
          destino={listadoDe(null)}
        />
        {POR_ESTADO.map((indicador) => (
          <CardIndicador
            key={indicador.estado}
            titulo={indicador.titulo}
            valor={indicadores[indicador.clave]}
            icono={indicador.estado.toLowerCase()}
            tono={indicador.estado}
            destino={listadoDe(indicador.estado)}
          />
        ))}
        {rol === 'ResponsableDeAmbiente' ? (
          <CardIndicador
            variante="texto"
            titulo="A su cargo"
            valor={`${ambientesACargo.length} ${ambientesACargo.length === 1 ? 'ambiente' : 'ambientes'}`}
            detalle={
              ambientesACargo.length === 0
                ? 'Sin ambientes asignados'
                : fuera === 0
                  ? 'Todos disponibles'
                  : `${fuera} en mantenimiento`
            }
            icono="ambientes"
            tono="info"
          />
        ) : (
          <CardIndicador
            variante="texto"
            titulo={rol === 'Solicitante' ? 'El que más usa' : 'Ambiente más utilizado'}
            valor={masUtilizados.length > 0 ? masUtilizados.map((uso) => uso.nombre_ambiente).join(' y ') : '—'}
            detalle={
              masUtilizados.length === 0
                ? 'Aún no hay reservas'
                : `${reservas(masUtilizados[0].total_reservas)}${masUtilizados.length > 1 ? ' cada uno (empate)' : ''}`
            }
            icono="estrella"
            tono="estrella"
          />
        )}
      </div>
    </section>
  )
}
