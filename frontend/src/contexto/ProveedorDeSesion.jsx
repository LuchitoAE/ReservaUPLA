import { useEffect, useState } from 'react'
import * as autenticacion from '../api/autenticacionApi'
import { SESION_TERMINADA } from '../api/clienteApi'
import { ContextoUsuarioActual } from './contextoUsuarioActual'

// Sesión de la SPA. Al abrirse pregunta a la API si ya hay una sesión (la cookie sobrevive a recargar la página).
// Si la API responde 401 a mitad del uso, la sesión se da por terminada y el layout lleva a la pantalla de ingreso
// con un aviso (el usuario sabe por qué salió: visibilidad del estado del sistema). «motivo» dice por qué no hay
// sesión: 'terminada' (venció) o 'salida' (la cerró el usuario).
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))
const sinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function ProveedorDeSesion({ children }) {
  const [sesion, setSesion] = useState({ cargando: true, usuario: null, motivo: null })
  // Mientras entra o sale una sesión, la pantalla se desvanece (160 ms) antes de cambiar de página. Es corto y, con
  // «menos movimiento», no se espera.
  const [transicionando, setTransicionando] = useState(false)

  useEffect(() => {
    let vigente = true
    autenticacion
      .obtenerSesion()
      .then(({ data }) => vigente && setSesion({ cargando: false, usuario: data, motivo: null }))
      .catch(() => vigente && setSesion({ cargando: false, usuario: null, motivo: null }))
    const alTerminar = () => setSesion({ cargando: false, usuario: null, motivo: 'terminada' })
    window.addEventListener(SESION_TERMINADA, alTerminar)
    return () => {
      vigente = false
      window.removeEventListener(SESION_TERMINADA, alTerminar)
    }
  }, [])

  async function iniciarSesion(credenciales) {
    const respuesta = await autenticacion.iniciarSesion(credenciales)
    if (!sinMovimiento()) {
      setTransicionando(true)
      await esperar(160)
    }
    setSesion({ cargando: false, usuario: respuesta.data, motivo: null })
    setTransicionando(false)
    return respuesta
  }

  async function cerrarSesion() {
    if (!sinMovimiento()) {
      setTransicionando(true)
    }
    await Promise.all([autenticacion.cerrarSesion().catch(() => null), sinMovimiento() ? null : esperar(160)])
    setSesion({ cargando: false, usuario: null, motivo: 'salida' })
    setTransicionando(false)
  }

  return (
    <ContextoUsuarioActual
      value={{
        usuarioActual: sesion.usuario,
        cargando: sesion.cargando,
        motivoSinSesion: sesion.motivo,
        transicionando,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoUsuarioActual>
  )
}
