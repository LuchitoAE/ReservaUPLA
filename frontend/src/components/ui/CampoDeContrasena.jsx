import { useState } from 'react'
import { CampoBase } from './CampoBase'

// Campo de contraseña. Oculta lo que se escribe, con un botón «Mostrar» para revisarla (control del usuario y
// prevención de errores) y un aviso si Bloq Mayús está activado (feedback antes de que falle el ingreso).
export function CampoDeContrasena({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, autoComplete = 'current-password', ...resto }) {
  const [visible, setVisible] = useState(false)
  const [mayusculas, setMayusculas] = useState(false)

  const revisarMayusculas = (evento) => setMayusculas(evento.getModifierState?.('CapsLock') ?? false)

  return (
    <CampoBase
      id={id}
      etiqueta={etiqueta}
      obligatorio={obligatorio}
      ayuda={ayuda}
      error={error}
      aviso={mayusculas ? 'Bloq Mayús está activado.' : null}
      adorno={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute top-1/2 right-1.5 min-h-9 -translate-y-1/2 rounded-md px-3 text-sm font-semibold text-enlace transition hover:bg-seleccion active:translate-y-[calc(-50%+1px)] focus-visible:outline-3 focus-visible:outline-foco"
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      }
    >
      <input
        type={visible ? 'text' : 'password'}
        value={valor}
        autoComplete={autoComplete}
        onChange={(evento) => onCambiar(evento.target.value)}
        onKeyUp={revisarMayusculas}
        onKeyDown={revisarMayusculas}
        onBlur={(evento) => {
          setMayusculas(false)
          onSalir?.(evento)
        }}
        {...resto}
      />
    </CampoBase>
  )
}
