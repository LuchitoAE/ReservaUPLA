import { useMemo, useState } from 'react'
import { listarUsuarios } from '../api/usuariosApi'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Button } from '../components/ui/Button'
import { ChipsDeFiltro } from '../components/ui/ChipsDeFiltro'
import { EtiquetaDeEstado } from '../components/ui/EtiquetaDeEstado'
import { TableList } from '../components/ui/TableList'
import { useFilaNueva } from '../hooks/useFilaNueva'
import { useConsulta } from '../hooks/useConsulta'
import { avisoDeError } from '../utils/avisoDeError'
import { ROLES } from '../utils/formato'

const COLUMNAS = [
  { clave: 'codigo_usuario', titulo: 'Código' },
  { clave: 'nombre_completo_usuario', titulo: 'Nombre completo' },
  { clave: 'correo_usuario', titulo: 'Correo' },
  { clave: 'rol_usuario', titulo: 'Rol', celda: (usuario) => ROLES[usuario.rol_usuario] },
  {
    clave: 'activo_usuario',
    titulo: 'Estado',
    celda: (usuario) => (
      <EtiquetaDeEstado estado={usuario.activo_usuario ? 'Activo' : 'Inactivo'} tono={usuario.activo_usuario ? 'exito' : 'neutro'} />
    ),
  },
]

const CHIPS = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'Solicitante', etiqueta: 'Solicitantes' },
  { valor: 'Administrador', etiqueta: 'Administradores' },
  { valor: 'ResponsableDeAmbiente', etiqueta: 'Responsables' },
]

// Usuarios registrados (RF-01, diseño AD15), con acceso al formulario de registro. Los chips filtran por rol y dicen
// cuántas cuentas hay de cada uno.
export function Usuarios() {
  const idNuevo = useFilaNueva()
  const { datos, cargando, error } = useConsulta(() => listarUsuarios(), [])
  const [rol, setRol] = useState('')

  const usuarios = useMemo(() => datos ?? [], [datos])
  const chips = useMemo(
    () =>
      CHIPS.map((chip) => ({
        ...chip,
        cantidad: chip.valor ? usuarios.filter((usuario) => usuario.rol_usuario === chip.valor).length : usuarios.length,
      })),
    [usuarios],
  )
  const filtrados = rol ? usuarios.filter((usuario) => usuario.rol_usuario === rol) : usuarios

  return (
    <>
      <EncabezadoDePagina
        titulo="Usuarios"
        descripcion="Personas que solicitan, aprueban o supervisan las reservas."
        acciones={
          <Button destino="/usuarios/nuevo" variante="principal">
            Nuevo usuario
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        {error && <AlertMessage tipo="error" aviso={avisoDeError(error)} />}
        {!cargando && (
          <div className="rounded-xl border border-borde bg-superficie p-4">
            <ChipsDeFiltro etiqueta="Filtrar por rol" opciones={chips} valor={rol} alCambiar={setRol} />
          </div>
        )}
        <TableList
          titulo="Usuarios"
          columnas={COLUMNAS}
          filas={filtrados}
          claveFila="id_usuario"
          filaNueva={idNuevo}
          cargando={cargando}
          vacio={usuarios.length === 0 ? 'Todavía no hay usuarios registrados.' : 'No hay usuarios con este rol.'}
          textoVacio={usuarios.length === 0 ? undefined : 'Elija «Todos» para ver el listado completo.'}
          iconoVacio="usuarios"
          notaPie="Las cuentas las crea el administrador, con el código que da la universidad."
        />
      </div>
    </>
  )
}
