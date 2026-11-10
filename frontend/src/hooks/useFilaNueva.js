import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

// El registro que una página deja marcado a la siguiente al navegar: el ambiente o el usuario recién registrado,
// para resaltar su fila como «Nuevo» en la lista (RNF-04: el resultado queda a la vista, además del aviso flotante).
// Se lee una vez y se borra del historial, para que no reaparezca al recargar o al volver atrás.
export function useFilaNueva() {
  const { pathname, state } = useLocation()
  const navegar = useNavigate()
  const [idNuevo] = useState(state?.nuevo ?? null)

  useEffect(() => {
    if (state?.nuevo) {
      navegar(pathname, { replace: true, state: null })
    }
  }, [state, pathname, navegar])

  return idNuevo
}
