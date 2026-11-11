import { describe, expect, it } from 'vitest'
import { normalizarCambioDeContrasena, reglasDeCambioDeContrasena } from './usuario'

const VALIDO = { contrasena_actual: 'Reserva2026', contrasena_nueva: 'Nueva2027', repetir_contrasena: 'Nueva2027' }

// RF-11 y diseño S15/S16: la actual, la nueva (RN-13, distinta de la actual) y su repetición. Las mismas reglas que
// Usuario.CambiarContrasena; la repetición solo la revisa la interfaz.
describe('reglasDeCambioDeContrasena', () => {
  it('pide los tres campos', () => {
    expect(reglasDeCambioDeContrasena.validarTodo({ contrasena_actual: '', contrasena_nueva: '', repetir_contrasena: '' })).toEqual({
      contrasena_actual: 'Escriba su contraseña actual.',
      contrasena_nueva: 'Escriba una contraseña.',
      repetir_contrasena: 'Repita la nueva contraseña.',
    })
  })

  it('la nueva cumple RN-13 y es distinta de la actual', () => {
    expect(reglasDeCambioDeContrasena.validarCampo('contrasena_nueva', { ...VALIDO, contrasena_nueva: 'corta' })).toBe(
      'Mínimo 8 caracteres, con mayúscula, minúscula y número.',
    )
    expect(reglasDeCambioDeContrasena.validarCampo('contrasena_nueva', { ...VALIDO, contrasena_nueva: 'Reserva2026' })).toBe(
      'Debe ser distinta de la actual.',
    )
  })

  it('las dos nuevas coinciden', () => {
    expect(reglasDeCambioDeContrasena.validarCampo('repetir_contrasena', { ...VALIDO, repetir_contrasena: 'Nueva2028' })).toBe(
      'Las dos contraseñas no coinciden.',
    )
  })

  it('sin errores cuando todo está bien', () => {
    expect(reglasDeCambioDeContrasena.validarTodo(VALIDO)).toEqual({})
  })

  it('envía solo la actual y la nueva, tal cual (los espacios cuentan)', () => {
    expect(normalizarCambioDeContrasena({ ...VALIDO, contrasena_actual: ' Reserva2026' })).toEqual({
      contrasena_actual: ' Reserva2026',
      contrasena_nueva: 'Nueva2027',
    })
  })
})
