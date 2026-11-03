import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { AlertMessage } from '../components/ui/AlertMessage'

// Página de inicio. Más adelante muestra el dashboard con los indicadores de reservas (RF-08).
export function Inicio() {
  return (
    <>
      <EncabezadoDePagina
        titulo="Inicio"
        conMigas={false}
        descripcion="Reservas de laboratorios, auditorios y salas de la universidad."
      />
      <AlertMessage tipo="info" titulo="Sistema en construcción.">
        Las secciones del menú se habilitan a medida que se desarrollan.
      </AlertMessage>
    </>
  )
}
