import { CampoBase } from './CampoBase'

// Campo de fecha reutilizable (componente «DateInput» del caso): el calendario del navegador, en AAAA-MM-DD.
// «minimo» y «maximo» limitan lo que se puede elegir; la regla igual se valida al salir y en la API.
export function DateInput({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, minimo, maximo, ...resto }) {
  return (
    <CampoBase id={id} etiqueta={etiqueta} obligatorio={obligatorio} ayuda={ayuda} error={error}>
      <input
        type="date"
        value={valor}
        min={minimo}
        max={maximo}
        onChange={(evento) => onCambiar(evento.target.value)}
        onBlur={onSalir}
        {...resto}
      />
    </CampoBase>
  )
}
