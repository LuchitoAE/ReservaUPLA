import { describe, expect, it } from 'vitest'
import { crearValidador, requerido, revisarErrores } from './validaciones'

const reglas = crearValidador({
  contrasena_actual: (valor) => requerido(valor, 'Escriba su contraseña actual.'),
  repetir: (valor, valores) => (valor !== valores.nueva ? 'Las dos contraseñas no coinciden.' : null),
})

// Al cambiar o dejar un campo se vuelven a revisar los errores que se ven. Un error que dio la API (la contraseña
// actual no es correcta, el código ya existe) no lo puede decidir la regla del navegador: se mantiene hasta que la
// persona cambia ese campo (defecto del 09/11/2026: se borraba al pasar el foco de un campo a otro).
describe('revisarErrores', () => {
  const del_servidor = { contrasena_actual: 'Equivocada1' }
  const anteriores = { contrasena_actual: 'La contraseña actual no es correcta.' }

  it('el error de la API se queda mientras el campo no cambia, aunque la regla del navegador lo dé por bueno', () => {
    const valores = { contrasena_actual: 'Equivocada1', nueva: 'Nueva2027', repetir: 'Nueva2027' }

    expect(revisarErrores({ anteriores, valores, reglas, campo: 'repetir', delServidor: del_servidor })).toEqual(anteriores)
  })

  it('se va cuando la persona cambia ese campo', () => {
    const valores = { contrasena_actual: 'Temporal2026', nueva: 'Nueva2027', repetir: 'Nueva2027' }

    expect(revisarErrores({ anteriores, valores, reglas, delServidor: del_servidor })).toEqual({})
  })

  it('si al cambiarlo queda mal para la regla del navegador, muestra ese error', () => {
    const valores = { contrasena_actual: '', nueva: 'Nueva2027', repetir: 'Nueva2027' }

    expect(revisarErrores({ anteriores, valores, reglas, delServidor: del_servidor })).toEqual({
      contrasena_actual: 'Escriba su contraseña actual.',
    })
  })

  it('los errores del navegador se revisan como siempre: al corregir, desaparecen', () => {
    const valores = { contrasena_actual: 'x', nueva: 'Nueva2027', repetir: 'Nueva2027' }

    expect(revisarErrores({ anteriores: { repetir: 'Las dos contraseñas no coinciden.' }, valores, reglas })).toEqual({})
  })

  it('el campo que se deja se revisa aunque no tuviera error', () => {
    const valores = { contrasena_actual: '', nueva: 'Nueva2027', repetir: 'Nueva2027' }

    expect(revisarErrores({ anteriores: {}, valores, reglas, campo: 'contrasena_actual' })).toEqual({
      contrasena_actual: 'Escriba su contraseña actual.',
    })
  })

  it('un error de la API en un campo sin regla del navegador se va al cambiar ese campo', () => {
    const sin_regla = { correo: 'Ya existe un usuario con ese correo.' }

    expect(revisarErrores({ anteriores: sin_regla, valores: { correo: 'a@upla.edu.pe' }, reglas, delServidor: { correo: 'b@upla.edu.pe' } })).toEqual({})
    expect(revisarErrores({ anteriores: sin_regla, valores: { correo: 'b@upla.edu.pe' }, reglas, delServidor: { correo: 'b@upla.edu.pe' } })).toEqual(sin_regla)
  })
})
