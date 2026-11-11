import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { revisarErrores } from '../reglas/validaciones'
import { avisoDeError } from '../utils/avisoDeError'

// Estado y comportamiento comunes de todos los formularios (usuario, ambiente, reserva): valores, errores por
// campo, validación al salir y al enviar, foco en el primer error, envío sin repetir y errores del servidor junto
// a su campo. Cada formulario solo aporta sus reglas y qué hacer con los datos.
//   reglas:       { validarCampo(campo, valores), validarTodo(valores) }   (ver reglas/validaciones.js)
//   obligatorios: { campo: 'cómo se llama para el usuario' }. Mientras alguno esté vacío, «faltan» los nombra y el
//                 botón de enviar queda deshabilitado (restricción, Norman): no se puede cometer el error.
//   automaticos:  campos que llena el sistema (el solicitante): no cuentan como cambios del usuario.
//   alEnviar(valores): la llamada a la API; si lanza un ErrorDeApi, sus errores se muestran.
//   textoDeFallo: cómo empieza el resumen cuando el envío falla («No se registró»); null, sin prefijo (el ingreso).
// Si el envío falla, «resumenDeError» lo dice en una línea para mostrarla junto al botón de enviar (RNF-04): cuántos
// campos corregir (se actualiza mientras se corrigen) o, si la API rechazó sin señalar un campo, su mensaje.
// Si el usuario intenta salir con datos escritos y sin guardar, «bloqueo» lo detiene para preguntarle (reversión
// fácil y prevención de errores, Shneiderman): AccionesDeFormulario muestra la confirmación.
export function useFormulario({ iniciales, reglas, obligatorios = {}, automaticos = [], alEnviar, textoDeFallo = 'No se registró' }) {
  const [valores, setValores] = useState(iniciales)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  // null, 'campos' (hay campos por corregir) o { mensaje } (la API lo rechazó sin señalar un campo).
  const [fallo, setFallo] = useState(null)

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

  // El valor de cada campo cuando la API lo rechazó: ese error se mantiene hasta que la persona cambie el campo.
  const delServidor = useRef({})

  // Vuelve a revisar los campos que ya muestran un error (y «campo», si se pide): así el mensaje desaparece en cuanto
  // se corrige, también cuando depende de otro campo (la hora de fin se compara con la de inicio).
  function revisar(nuevos, campo) {
    setErrores((anteriores) => revisarErrores({ anteriores, valores: nuevos, reglas, campo, delServidor: delServidor.current }))
  }

  function cambiar(campo, valor) {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    if (fallo?.mensaje) {
      setFallo(null)
    }
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
      setFallo('campos')
      return
    }

    setErrores({})
    setFallo(null)
    delServidor.current = {}
    setEnviando(true)
    guardando.current = true
    try {
      await alEnviar(valores)
    } catch (error) {
      guardando.current = false
      const conCampos = Object.keys(error.errores ?? {}).length > 0
      if (conCampos) {
        delServidor.current = Object.fromEntries(Object.keys(error.errores).map((nombre) => [nombre, valores[nombre]]))
        mostrarErrores(error.errores)
      }
      setFallo(conCampos ? 'campos' : { mensaje: avisoDeError(error).mensaje })
      setAviso(avisoDeError(error))
    } finally {
      setEnviando(false)
    }
  }

  // Después de guardar sin salir de la página (Mi cuenta): el formulario vuelve a empezar, sin datos ni errores, y
  // ya no pregunta antes de salir.
  function reiniciar() {
    setValores(iniciales)
    setErrores({})
    setFallo(null)
    setAviso(null)
    delServidor.current = {}
    guardando.current = false
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

  const cantidadDeErrores = Object.keys(errores).length
  const detalleDelFallo = !fallo
    ? null
    : cantidadDeErrores > 0
      ? `corrija ${cantidadDeErrores === 1 ? 'el campo marcado' : `los ${cantidadDeErrores} campos marcados`}.`
      : (fallo.mensaje ?? null)
  const resumenDeError = !detalleDelFallo
    ? null
    : textoDeFallo
      ? `${textoDeFallo}: ${detalleDelFallo}`
      : detalleDelFallo.charAt(0).toUpperCase() + detalleDelFallo.slice(1)

  return { valores, errores, enviando, aviso, resumenDeError, faltan, modificado, bloqueo, campo, cambiar, enviar, reiniciar }
}
