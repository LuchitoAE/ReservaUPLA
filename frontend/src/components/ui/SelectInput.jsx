import { CampoBase } from './CampoBase'

// Lista desplegable reutilizable (componente «SelectInput» del caso). Las opciones llegan como
// [{ valor, etiqueta }]; la primera opción vacía invita a elegir y no se puede volver a seleccionar.
export function SelectInput({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, opciones, textoVacio = 'Elija una opción', ...resto }) {
  return (
    <CampoBase id={id} etiqueta={etiqueta} obligatorio={obligatorio} ayuda={ayuda} error={error}>
      <select value={valor} onChange={(evento) => onCambiar(evento.target.value)} onBlur={onSalir} {...resto}>
        <option value="" disabled>
          {textoVacio}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </CampoBase>
  )
}
