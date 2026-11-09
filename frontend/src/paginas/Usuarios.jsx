import { listarUsuarios } from '../api/usuariosApi'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { TableList } from '../components/ui/TableList'
import { useAvisoDeNavegacion } from '../hooks/useAvisoDeNavegacion'
import { useConsulta } from '../hooks/useConsulta'
import { avisoDeError } from '../utils/avisoDeError'
import { ROLES } from '../utils/formato'

const COLUMNAS = [
  { clave: 'codigo_usuario', titulo: 'Código' },
  { clave: 'nombre_completo_usuario', titulo: 'Nombre completo' },
  { clave: 'correo_usuario', titulo: 'Correo' },
  { clave: 'rol_usuario', titulo: 'Rol', celda: (usuario) => ROLES[usuario.rol_usuario] },
  { clave: 'activo_usuario', titulo: 'Estado', celda: (usuario) => (usuario.activo_usuario ? 'Activo' : 'Inactivo') },
]

// Usuarios registrados (RF-01), con acceso al formulario de registro.
export function Usuarios() {
  const aviso = useAvisoDeNavegacion()
  const { datos, cargando, error } = useConsulta(() => listarUsuarios(), [])

  return (
    <>
      <EncabezadoDePagina
        titulo="Usuarios"
        descripcion="Personas que solicitan, aprueban o supervisan las reservas."
        acciones={
          <Button destino="/usuarios/nuevo" variante="principal">
            Registrar usuario
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        {aviso && <AlertMessage tipo="exito" titulo={aviso} />}
        {error && <AlertMessage tipo="error" aviso={avisoDeError(error)} />}
        <TableList
          titulo="Usuarios"
          columnas={COLUMNAS}
          filas={datos ?? []}
          claveFila="id_usuario"
          cargando={cargando}
          vacio="Todavía no hay usuarios registrados."
        />
      </div>
    </>
  )
}
