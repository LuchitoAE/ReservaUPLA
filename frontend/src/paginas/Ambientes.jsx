import { listarAmbientes } from '../api/ambientesApi'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { TableList } from '../components/ui/TableList'
import { useFilaNueva } from '../hooks/useFilaNueva'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'
import { avisoDeError } from '../utils/avisoDeError'
import { ESTADOS_AMBIENTE, TIPOS_AMBIENTE } from '../utils/formato'

const COLUMNAS = [
  { clave: 'nombre_ambiente', titulo: 'Nombre' },
  { clave: 'tipo_ambiente', titulo: 'Tipo', celda: (ambiente) => TIPOS_AMBIENTE[ambiente.tipo_ambiente] },
  { clave: 'capacidad_ambiente', titulo: 'Capacidad', alinear: 'derecha' },
  { clave: 'ubicacion_ambiente', titulo: 'Ubicación' },
  { clave: 'estado_ambiente', titulo: 'Estado', celda: (ambiente) => ESTADOS_AMBIENTE[ambiente.estado_ambiente] },
  { clave: 'nombre_responsable_ambiente', titulo: 'Responsable', celda: (ambiente) => ambiente.nombre_responsable_ambiente ?? '—' },
]

// Ambientes registrados (RF-02). Solo el administrador ve el acceso al formulario de registro.
export function Ambientes() {
  const idNuevo = useFilaNueva()
  const { usuarioActual } = useUsuarioActual()
  const esAdministrador = usuarioActual.rol_usuario === 'Administrador'
  const { datos, cargando, error } = useConsulta(() => listarAmbientes(), [])

  return (
    <>
      <EncabezadoDePagina
        titulo="Ambientes"
        descripcion="Laboratorios, auditorios y salas que se pueden reservar."
        acciones={
          esAdministrador && (
            <Button destino="/ambientes/nuevo" variante="principal">
              Registrar ambiente
            </Button>
          )
        }
      />
      <div className="flex flex-col gap-4">
        {error && <AlertMessage tipo="error" aviso={avisoDeError(error)} />}
        <TableList
          titulo="Ambientes"
          columnas={COLUMNAS}
          filas={datos ?? []}
          claveFila="id_ambiente"
          filaNueva={idNuevo}
          cargando={cargando}
          vacio="Todavía no hay ambientes registrados."
        />
      </div>
    </>
  )
}
