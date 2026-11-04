import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { avisoDeError } from '../utils/avisoDeError'

// Estado y comportamiento comunes de todos los formularios (usuario, ambiente, reserva): valores, errores por
// campo, validación al salir y al enviar, foco en el primer error, envío sin repetir y errores del servidor junto
// a su campo. Cada formulario solo aporta sus reglas y qué hacer con los datos.
//   reglas:       { validarCampo(campo, valores), validarTodo(valores) }   (ver reglas/validaciones.js)
//   obligatorios: { campo: 'cómo se llama para el usuario' }. Mientras alguno esté vacío, «faltan» los nombra y el
//                 botón de enviar queda deshabilitado (restricción, Norman): no se puede cometer el error.
//   automaticos:  campos que llena el sistema (el solicitante): no cuentan como cambios del usuario.
//   alEnviar(valores): la llamada a la API; si lanza un ErrorDeApi, sus errores se muestran.
// Si el usuario intenta salir con datos escritos y sin guardar, «bloqueo» lo detiene para preguntarle (reversión
// fácil y prevención de errores, Shneiderman): AccionesDeFormulario muestra la confirmación.
export function useFormulario({ iniciales, reglas, obligatorios = {}, automaticos = [], alEnviar }) {
  const [valores, setValores] = useState(iniciales)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const faltan = Object.entries(obligatorios)
    .filter(([nombre]) => String(valores[nombre] ?? '').trim() === '')
    .map(([, nombreVisible]) => nombreVisible)
  const modificado = Object.keys(iniciales).some((nombre) => !automaticos.includes(nombre) && valores[nombre] !== iniciales[nombre])

  // El bloqueo se decide en el momento de navegar: con referencias, porque guardar y salir ocurren en el mismo paso.
  const hayCambios = useRef(false)
  const guardando = useRef(false)
  useEffect(() => {
    hayCambios.current = modificado
  }, [modificado])
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hayCambios.current && !guardando.current && currentLocation.pathname !== nextLocation.pathname,
  )

  // Vuelve a revisar los campos que ya muestran un error (y «campo», si se pide): así el mensaje desaparece en cuanto
  // se corrige, también cuando depende de otro campo (la hora de fin se compara con la de inicio).
  function revisar(nuevos, campo) {
    setErrores((anteriores) => {
      const revisados = new Set([...Object.keys(anteriores), ...(campo ? [campo] : [])])
      return Object.fromEntries(
        [...revisados]
          .map((nombre) => [nombre, reglas.tiene(nombre) ? reglas.validarCampo(nombre, nuevos) : anteriores[nombre]])
          .filter(([, mensaje]) => mensaje),
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
    if (enviando || faltan.length > 0) {
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
    guardando.current = true
    try {
      await alEnviar(valores)
    } catch (error) {
      guardando.current = false
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

  return { valores, errores, enviando, aviso, faltan, modificado, bloqueo, campo, cambiar, enviar }
}
