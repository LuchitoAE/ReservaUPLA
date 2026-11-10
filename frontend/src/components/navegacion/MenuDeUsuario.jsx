import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useUsuarioActual } from '../../hooks/useUsuarioActual'
import { ROLES } from '../../utils/formato'
import { Icono } from '../ui/Icono'

// Iniciales del nombre para el avatar del chip (diseños AD01, S01, R01 y T2): «Luis Aquino Espinoza» → «LA».
function iniciales(nombreCompleto) {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

// Chip de la sesión en la barra superior: quién entró, con qué rol y desde dónde se cambia de cuenta. El menú se
// abre con el chip y se cierra al elegir, al pulsar fuera o con Escape (control del usuario, Shneiderman).
// Reemplaza al panel «Sesión iniciada» que iba en la barra lateral: en el diseño la sesión vive arriba a la derecha.
export function MenuDeUsuario() {
  const { usuarioActual, cerrarSesion } = useUsuarioActual()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)
  const idMenu = useId()

  useEffect(() => {
    if (!abierto) {
      return undefined
    }
    const alPulsarFuera = (evento) => {
      if (!contenedor.current?.contains(evento.target)) {
        setAbierto(false)
      }
    }
    const alPulsarTecla = (evento) => {
      if (evento.key === 'Escape') {
        setAbierto(false)
      }
    }
    document.addEventListener('pointerdown', alPulsarFuera)
    document.addEventListener('keydown', alPulsarTecla)
    return () => {
      document.removeEventListener('pointerdown', alPulsarFuera)
      document.removeEventListener('keydown', alPulsarTecla)
    }
  }, [abierto])

  if (!usuarioActual) {
    return null
  }

  const rol = ROLES[usuarioActual.rol_usuario]
  const opcion = 'flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold text-texto transition hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco'

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls={idMenu}
        aria-label={`Sesión de ${usuarioActual.nombre_completo_usuario}`}
        className="flex min-h-11 items-center gap-2.5 rounded-full border border-borde-control bg-superficie py-1 pr-3 pl-1 transition hover:bg-superficie-tenue focus-visible:outline-3 focus-visible:outline-foco"
      >
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-acento text-sm font-bold text-acento-texto"
        >
          {iniciales(usuarioActual.nombre_completo_usuario)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-texto">{usuarioActual.nombre_completo_usuario}</span>
          <span className="block text-xs text-texto-suave">{rol}</span>
        </span>
        <Icono nombre="siguiente" className="hidden size-4 rotate-90 text-texto-suave sm:block" />
      </button>

      {abierto && (
        <div
          id={idMenu}
          className="absolute right-0 z-40 mt-2 flex w-64 flex-col gap-1 rounded-xl border border-borde bg-superficie p-2 shadow-lg"
        >
          <p className="px-3 py-2 text-sm text-texto-suave">
            <strong className="block text-texto">{usuarioActual.nombre_completo_usuario}</strong>
            {rol}
          </p>
          <Link to="/mi-cuenta" onClick={() => setAbierto(false)} className={opcion}>
            <Icono nombre="usuarios" />
            Mi cuenta
          </Link>
          <button type="button" onClick={cerrarSesion} className={opcion}>
            <Icono nombre="cerrar" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
