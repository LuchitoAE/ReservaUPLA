import { useState } from 'react'
import { listarUsuarios } from '../api/usuariosApi'
import { useConsulta } from '../hooks/useConsulta'
import { ContextoUsuarioActual } from './contextoUsuarioActual'

const CLAVE = 'reservaupla.usuario-actual'

// Guardar la elección en el navegador es solo una comodidad: si no se puede, la página funciona igual.
function leerElegido() {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

function guardarElegido(id) {
  try {
    localStorage.setItem(CLAVE, id)
  } catch {
    // Sin almacenamiento (ventana privada): la elección dura hasta recargar.
  }
}

// Carga los usuarios activos y recuerda cuál eligió la persona. Todas las páginas lo leen con useUsuarioActual().
export function ProveedorUsuarioActual({ children }) {
  const { datos, cargando, recargar } = useConsulta(() => listarUsuarios({ activo_usuario: true }), [])
  const [idElegido, setIdElegido] = useState(leerElegido)

  const usuarios = datos ?? []
  const usuarioActual = usuarios.find((usuario) => usuario.id_usuario === idElegido) ?? null

  function elegir(id) {
    setIdElegido(id)
    guardarElegido(id)
  }

  return (
    <ContextoUsuarioActual value={{ usuarios, cargando, usuarioActual, elegir, recargarUsuarios: recargar }}>
      {children}
    </ContextoUsuarioActual>
  )
}
