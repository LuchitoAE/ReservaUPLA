import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { FormularioUsuario } from '../components/usuarios/FormularioUsuario'

// Página del formulario de registro de usuarios (RF-01).
export function NuevoUsuario() {
  return (
    <>
      <EncabezadoDePagina
        titulo="Nuevo usuario"
        descripcion="Registre a una persona con el código que le dio la universidad y elija qué podrá hacer."
      />
      <section>
        <FormularioUsuario />
      </section>
    </>
  )
}
