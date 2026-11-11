import { useCallback, useEffect, useEffectEvent, useState } from 'react'

// Consulta reutilizable a la API: pide los datos al abrir la página y cada vez que cambian sus filtros, y expone
// cargando / datos / error para que la página los muestre. «recargar» vuelve a pedir (por ejemplo, tras un cambio).
// Si la página cambia antes de que llegue la respuesta, la respuesta vieja se descarta («vigente»).
// «consultar» se lee como evento del efecto: siempre usa la versión del dibujo actual sin obligar a repetir la consulta.
export function useConsulta(consultar, dependencias = []) {
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })
  const [version, setVersion] = useState(0)
  const clave = `${JSON.stringify(dependencias)}|${version}`
  const consultarVigente = useEffectEvent(consultar)

  useEffect(() => {
    let vigente = true
    consultarVigente()
      .then((respuesta) => vigente && setResultado({ clave, datos: respuesta.data, error: null }))
      .catch((error) => vigente && setResultado({ clave, datos: null, error }))
    return () => {
      vigente = false
    }
  }, [clave])

  // Mientras la respuesta de esta consulta no llega, se conservan los datos anteriores y no se arrastra el error.
  const cargando = resultado.clave !== clave
  const error = cargando ? null : resultado.error
  const recargar = useCallback(() => setVersion((anterior) => anterior + 1), [])

  return { cargando, datos: resultado.datos, error, recargar }
}
