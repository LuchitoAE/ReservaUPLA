import { describe, expect, it } from 'vitest'
import { normalizarUsuario, reglasDeIngreso, reglasDeUsuario } from './usuario'

// Las mismas reglas que el dominio: RF-09 (ingreso con código) y RF-01 (registro con código, RN-14).
describe('reglas de ingreso', () => {
  it('pide el código y la contraseña', () => {
    expect(reglasDeIngreso.validarTodo({ codigo_usuario: '', contrasena_usuario: '' })).toEqual({
      codigo_usuario: 'Escriba su código.',
      contrasena_usuario: 'Escriba su contraseña.',
    })
  })

  it('revisa el formato del código antes de enviarlo (AC02)', () => {
    expect(reglasDeIngreso.validarCampo('codigo_usuario', { codigo_usuario: 'abc' })).toBe(
      'Escriba un código válido, por ejemplo P00914K.',
    )
    for (const codigo of ['P00914K', 'admin01', ' SOLIC01 ']) {
      expect(reglasDeIngreso.validarCampo('codigo_usuario', { codigo_usuario: codigo })).toBeNull()
    }
  })
})

describe('reglas del registro de usuarios', () => {
  const valido = {
    codigo_usuario: 'p00914k',
    nombre_completo_usuario: 'Luis Aquino Espinoza',
    correo_usuario: 'luis.aquino@upla.edu.pe',
    rol_usuario: 'Solicitante',
    contrasena_usuario: 'Reserva2026',
  }

  it('acepta códigos de 7 letras o dígitos', () => {
    for (const codigo of ['P00914K', 'admin01', ' SOLIC01 ']) {
      expect(reglasDeUsuario.validarCampo('codigo_usuario', { ...valido, codigo_usuario: codigo })).toBeNull()
    }
  })

  it('explica qué falta en un código que no cumple', () => {
    expect(reglasDeUsuario.validarCampo('codigo_usuario', { ...valido, codigo_usuario: '' })).toBe('Escriba el código del usuario.')
    for (const codigo of ['P0091', 'P00914KX', 'P0091-K']) {
      expect(reglasDeUsuario.validarCampo('codigo_usuario', { ...valido, codigo_usuario: codigo })).toBe(
        'El código debe tener 7 letras o números, por ejemplo P00914K.',
      )
    }
  })

  it('envía el código normalizado', () => {
    expect(normalizarUsuario(valido).codigo_usuario).toBe('P00914K')
  })
})
