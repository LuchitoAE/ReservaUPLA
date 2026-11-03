import { CampoBase } from './CampoBase'

// Campo de hora reutilizable (componente «TimeInput» del caso): el reloj del navegador, en HH:mm (24 horas).
export function TimeInput({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, minimo, maximo, ...resto }) {
  return (
    <CampoBase id={id} etiqueta={etiqueta} obligatorio={obligatorio} ayuda={ayuda} error={error}>
      <input
        type="time"
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
