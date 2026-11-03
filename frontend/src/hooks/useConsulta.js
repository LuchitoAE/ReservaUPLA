import { useCallback, useEffect, useState } from 'react'

// Consulta reutilizable a la API: pide los datos al abrir la página y cada vez que cambian sus filtros, y expone
// cargando / datos / error para que la página los muestre. «recargar» vuelve a pedir (por ejemplo, tras un cambio).
// Si la página cambia antes de que llegue la respuesta, la respuesta vieja se descarta («vigente»).
export function useConsulta(consultar, dependencias) {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }))
    consultar()
      .then((respuesta) => vigente && setEstado({ cargando: false, datos: respuesta.data, error: null }))
      .catch((error) => vigente && setEstado({ cargando: false, datos: null, error }))
    return () => {
      vigente = false
    }
    // Las dependencias las decide quien llama (los filtros de la página); «consultar» cambia en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  const recargar = useCallback(() => setVersion((anterior) => anterior + 1), [])

  return { ...estado, recargar }
}
