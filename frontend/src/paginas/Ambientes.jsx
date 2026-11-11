import { useMemo, useState } from 'react'
import { listarAmbientes } from '../api/ambientesApi'
import { ChipsDeFiltro } from '../components/ui/ChipsDeFiltro'
import { ErrorDeCarga } from '../components/ui/ErrorDeCarga'
import { EtiquetaDeAmbiente } from '../components/ui/EtiquetaDeEstado'
import { TableList } from '../components/ui/TableList'
import { useFilaNueva } from '../hooks/useFilaNueva'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { ESTADOS_AMBIENTE, TIPOS_AMBIENTE } from '../utils/formato'

// Ambientes registrados (RF-02, diseños AD12 y R05). El administrador ve el acceso al formulario; el responsable ve
// marcados los ambientes a su cargo. Los chips filtran por estado y dicen cuántos hay en cada uno.
export function Ambientes() {
  const idNuevo = useFilaNueva()
  const { usuarioActual } = useUsuarioActual()
  const { datos, cargando, error, recargar } = useConsulta(() => listarAmbientes(), [])
  const [estado, setEstado] = useState('')

  const ambientes = useMemo(() => datos ?? [], [datos])
  const conteos = useMemo(() => {
    const porEstado = Object.fromEntries(Object.keys(ESTADOS_AMBIENTE).map((clave) => [clave, 0]))
    ambientes.forEach((ambiente) => {
      if (ambiente.estado_ambiente in porEstado) {
        porEstado[ambiente.estado_ambiente] += 1
      }
    })
    return { total: ambientes.length, ...porEstado }
  }, [ambientes])

  const filtrados = estado ? ambientes.filter((ambiente) => ambiente.estado_ambiente === estado) : ambientes

  const COLUMNAS = [
    {
      clave: 'nombre_ambiente',
      titulo: 'Nombre',
      ancho: 'w-[20%]',
      celda: (ambiente) => (
        <div>
          <span>{ambiente.nombre_ambiente}</span>
          {ambiente.id_responsable_ambiente === usuarioActual.id_usuario && (
            <span className="mt-1 block w-fit rounded-full bg-pendiente-fondo px-2 py-0.5 text-xs font-semibold text-pendiente-texto">
              A su cargo
            </span>
          )}
        </div>
      ),
    },
    { clave: 'tipo_ambiente', titulo: 'Tipo', ancho: 'w-[19%]', celda: (ambiente) => TIPOS_AMBIENTE[ambiente.tipo_ambiente] },
    { clave: 'capacidad_ambiente', titulo: 'Capacidad', ancho: 'w-[8%]', alinear: 'derecha' },
    { clave: 'ubicacion_ambiente', titulo: 'Ubicación', ancho: 'w-[18%]' },
    { clave: 'estado_ambiente', titulo: 'Estado', ancho: 'w-[16%]', celda: (ambiente) => <EtiquetaDeAmbiente estado={ambiente.estado_ambiente} /> },
    { clave: 'nombre_responsable_ambiente', titulo: 'Responsable', ancho: 'w-[19%]', celda: (ambiente) => ambiente.nombre_responsable_ambiente ?? '—' },
  ]

  const chips = [
    { valor: '', etiqueta: 'Todos', cantidad: conteos.total },
    { valor: 'Disponible', etiqueta: 'Disponibles', cantidad: conteos.Disponible },
    { valor: 'EnMantenimiento', etiqueta: 'En mantenimiento', cantidad: conteos.EnMantenimiento },
    { valor: 'Inactivo', etiqueta: 'Inactivos', cantidad: conteos.Inactivo },
  ]

  return (
    <>
      <div className="flex flex-col gap-4">
        {error && <ErrorDeCarga error={error} alReintentar={recargar} />}
        {!cargando && !error && (
          <div className="rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
            <ChipsDeFiltro etiqueta="Filtrar por estado" opciones={chips} valor={estado} alCambiar={setEstado} />
          </div>
        )}
        {!error && (
          <TableList
            titulo="Ambientes"
            columnas={COLUMNAS}
            filas={filtrados}
            claveFila="id_ambiente"
            filaNueva={idNuevo}
            cargando={cargando}
            vacio={ambientes.length === 0 ? 'Todavía no hay ambientes registrados.' : 'No hay ambientes con este estado.'}
            textoVacio={ambientes.length === 0 ? undefined : 'Elija «Todos» para ver el listado completo.'}
            iconoVacio="ambientes"
            notaPie="Solo los ambientes disponibles reciben reservas."
          />
        )}
      </div>
    </>
  )
}
