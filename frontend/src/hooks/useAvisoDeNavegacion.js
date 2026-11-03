import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

// Aviso que una página deja a la siguiente al navegar («Usuario registrado correctamente»). Se muestra una vez:
// se borra del historial para que no reaparezca al recargar o al volver atrás.
export function useAvisoDeNavegacion() {
  const { pathname, state } = useLocation()
  const navegar = useNavigate()
  const [aviso] = useState(state?.aviso ?? null)

  useEffect(() => {
    if (state?.aviso) {
      navegar(pathname, { replace: true, state: null })
    }
  }, [state, pathname, navegar])

  return aviso
}
