import { useState } from 'react'
import { CampoBase } from './CampoBase'
import { Icono } from './Icono'

// Campo de contraseña. Oculta lo que se escribe, con un ojo para revisarla (control del usuario y prevención de
// errores) y un aviso si Bloq Mayús está activado (feedback antes de que falle el ingreso). El candado de la
// izquierda acompaña a la etiqueta; el ojo dice en su nombre accesible qué hace.
export function CampoDeContrasena({ id, etiqueta, obligatorio, ayuda, error, valor, onCambiar, onSalir, autoComplete = 'current-password', ...resto }) {
  const [visible, setVisible] = useState(false)
  const [mayusculas, setMayusculas] = useState(false)

  const revisarMayusculas = (evento) => setMayusculas(evento.getModifierState?.('CapsLock') ?? false)
  const nombreDelBoton = visible ? 'Ocultar contraseña' : 'Mostrar contraseña'

  return (
    <CampoBase
      id={id}
      etiqueta={etiqueta}
      obligatorio={obligatorio}
      ayuda={ayuda}
      error={error}
      aviso={mayusculas ? 'Bloq Mayús está activado.' : null}
      icono="candado"
      adorno={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          aria-controls={id}
          aria-label={nombreDelBoton}
          title={nombreDelBoton}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-texto-suave transition hover:bg-seleccion hover:text-texto active:translate-y-[calc(-50%+1px)] focus-visible:outline-3 focus-visible:outline-foco"
        >
          <Icono nombre={visible ? 'ojo-tachado' : 'ojo'} />
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
