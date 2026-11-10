import { CampoBase } from './CampoBase'

// Campo de texto reutilizable (componente «TextInput» del caso). Con «multilinea» se dibuja como <textarea>.
// «maximo» limita lo que se puede escribir y muestra el contador «12/150»: el usuario ve cuánto le queda.
export function TextInput({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, maximo, multilinea = false, icono, ...resto }) {
  const Control = multilinea ? 'textarea' : 'input'
  const contador = maximo ? `${valor.length}/${maximo}` : null

  return (
    <CampoBase id={id} etiqueta={etiqueta} obligatorio={obligatorio} ayuda={ayuda} error={error} contador={contador} icono={icono}>
      <Control
        type={multilinea ? undefined : (resto.type ?? 'text')}
        rows={multilinea ? 4 : undefined}
        value={valor}
        maxLength={maximo}
        onChange={(evento) => onCambiar(evento.target.value)}
        onBlur={onSalir}
        {...resto}
      />
    </CampoBase>
  )
}
