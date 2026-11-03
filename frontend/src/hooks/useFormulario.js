import { useState } from 'react'
import { avisoDeError } from '../utils/avisoDeError'

// Estado y comportamiento comunes de todos los formularios (usuario, ambiente, reserva): valores, errores por
// campo, validación al salir y al enviar, foco en el primer error, envío sin repetir y errores del servidor junto
// a su campo. Cada formulario solo aporta sus reglas y qué hacer con los datos.
//   reglas:  { validarCampo(campo, valores), validarTodo(valores) }   (ver reglas/validaciones.js)
//   alEnviar(valores): la llamada a la API; si lanza un ErrorDeApi, sus errores se muestran.
export function useFormulario({ iniciales, reglas, alEnviar }) {
  const [valores, setValores] = useState(iniciales)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  function revisar(campo, nuevos, siempre) {
    setErrores((anteriores) => {
      if (!siempre && !anteriores[campo]) {
        return anteriores
      }
      const { [campo]: _anterior, ...resto } = anteriores
      const mensaje = reglas.validarCampo(campo, nuevos)
      return mensaje ? { ...resto, [campo]: mensaje } : resto
    })
  }

  function cambiar(campo, valor) {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    // Si el campo ya mostraba un error, se vuelve a revisar mientras se corrige.
    revisar(campo, nuevos, false)
  }

  function salir(campo) {
    revisar(campo, valores, true)
  }

  function mostrarErrores(encontrados) {
    setErrores(encontrados)
    const primero = Object.keys(encontrados)[0]
    document.getElementById(primero)?.focus()
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) {
      return
    }
    setAviso(null)
    const encontrados = reglas.validarTodo(valores)
    if (Object.keys(encontrados).length > 0) {
      mostrarErrores(encontrados)
      return
    }

    setErrores({})
    setEnviando(true)
    try {
      await alEnviar(valores)
    } catch (error) {
      if (Object.keys(error.errores ?? {}).length > 0) {
        mostrarErrores(error.errores)
      }
      setAviso(avisoDeError(error))
    } finally {
      setEnviando(false)
    }
  }

  // Lo que necesita cada campo (TextInput, SelectInput…): <TextInput {...campo('correo_usuario')} />
  function campo(nombre) {
    return {
      id: nombre,
      valor: valores[nombre],
      error: errores[nombre],
      onCambiar: (valor) => cambiar(nombre, valor),
      onSalir: () => salir(nombre),
    }
  }

  return { valores, errores, enviando, aviso, campo, cambiar, enviar }
}
