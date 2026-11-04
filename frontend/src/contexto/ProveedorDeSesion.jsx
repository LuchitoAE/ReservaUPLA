import { useEffect, useState } from 'react'
import * as autenticacion from '../api/autenticacionApi'
import { SESION_TERMINADA } from '../api/clienteApi'
import { ContextoUsuarioActual } from './contextoUsuarioActual'

// Sesión de la SPA. Al abrirse pregunta a la API si ya hay una sesión (la cookie sobrevive a recargar la página).
// Si la API responde 401 a mitad del uso, la sesión se da por terminada y el layout lleva a la pantalla de ingreso
// con un aviso (el usuario sabe por qué salió: visibilidad del estado del sistema). «motivo» dice por qué no hay
// sesión: 'terminada' (venció) o 'salida' (la cerró el usuario).
export function ProveedorDeSesion({ children }) {
  const [sesion, setSesion] = useState({ cargando: true, usuario: null, motivo: null })

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
    setSesion({ cargando: false, usuario: respuesta.data, motivo: null })
    return respuesta
  }

  async function crearCuenta(datos) {
    const respuesta = await autenticacion.crearCuenta(datos)
    setSesion({ cargando: false, usuario: respuesta.data, motivo: null })
    return respuesta
  }

  async function cerrarSesion() {
    await autenticacion.cerrarSesion().catch(() => null)
    setSesion({ cargando: false, usuario: null, motivo: 'salida' })
  }

  return (
    <ContextoUsuarioActual
      value={{
        usuarioActual: sesion.usuario,
        cargando: sesion.cargando,
        motivoSinSesion: sesion.motivo,
        iniciarSesion,
        crearCuenta,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoUsuarioActual>
  )
}
