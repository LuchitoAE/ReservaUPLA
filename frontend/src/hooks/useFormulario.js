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

  // Vuelve a revisar los campos que ya muestran un error (y «campo», si se pide): así el mensaje desaparece en cuanto
  // se corrige, también cuando depende de otro campo (la hora de fin se compara con la de inicio).
  function revisar(nuevos, campo) {
    setErrores((anteriores) => {
      const revisados = new Set([...Object.keys(anteriores), ...(campo ? [campo] : [])])
      return Object.fromEntries(
        [...revisados].map((nombre) => [nombre, reglas.validarCampo(nombre, nuevos)]).filter(([, mensaje]) => mensaje),
      )
    })
  }

  function cambiar(campo, valor) {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    revisar(nuevos)
  }

  function salir(campo) {
    revisar(valores, campo)
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
