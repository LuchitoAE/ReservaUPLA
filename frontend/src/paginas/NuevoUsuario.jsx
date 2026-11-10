import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'
import { FormularioUsuario } from '../components/usuarios/FormularioUsuario'

// Página del formulario de registro de usuarios (RF-01).
export function NuevoUsuario() {
  return (
    <>
      <EncabezadoDePagina
        titulo="Registrar usuario"
        descripcion="Quien solicita reservas, quien las aprueba o quien está a cargo de un ambiente."
      />
      <section className="max-w-3xl">
        <FormularioUsuario />
      </section>
    </>
  )
}
