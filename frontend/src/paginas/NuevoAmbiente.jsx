import { FormularioAmbiente } from '../components/ambientes/FormularioAmbiente'
import { EncabezadoDePagina } from '../components/navegacion/EncabezadoDePagina'

// Página del formulario de registro de ambientes (RF-02).
export function NuevoAmbiente() {
  return (
    <>
      <EncabezadoDePagina
        titulo="Registrar ambiente"
        descripcion="Un laboratorio, auditorio o sala que la universidad presta para reservas."
        migas={[{ nombre: 'Ambientes', ruta: '/ambientes' }]}
      />
      <section className="max-w-2xl rounded-xl border border-borde bg-superficie p-5 sm:p-6">
        <FormularioAmbiente />
      </section>
    </>
  )
}
