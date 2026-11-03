import { CampoBase } from './CampoBase'

// Lista desplegable reutilizable (componente «SelectInput» del caso). Las opciones llegan como
// [{ valor, etiqueta }]. La primera opción vacía invita a elegir; si el campo es «opcional», también sirve para
// dejarlo sin valor, y si no, ya no se puede volver a seleccionar.
export function SelectInput({
  id,
  etiqueta,
  obligatorio,
  ayuda,
  error,
  valor,
  onCambiar,
  onSalir,
  opciones,
  textoVacio = 'Elija una opción',
  opcional = false,
  ...resto
}) {
  return (
    <CampoBase id={id} etiqueta={etiqueta} obligatorio={obligatorio} ayuda={ayuda} error={error}>
      <select value={valor} onChange={(evento) => onCambiar(evento.target.value)} onBlur={onSalir} {...resto}>
        <option value="" disabled={!opcional}>
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
