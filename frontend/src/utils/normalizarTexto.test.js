import { describe, expect, it } from 'vitest'
import { normalizarCodigo } from './normalizarTexto'

// RN-14: el código se guarda sin espacios y en mayúsculas, igual que Domain/Common/CodigoDeUsuario.cs.
describe('normalizarCodigo', () => {
  it('quita los espacios y pasa a mayúsculas', () => {
    expect(normalizarCodigo(' p00914k ')).toBe('P00914K')
    expect(normalizarCodigo('P 00914 K')).toBe('P00914K')
    expect(normalizarCodigo('admin01')).toBe('ADMIN01')
  })

  it('devuelve vacío si no hay nada escrito', () => {
    expect(normalizarCodigo()).toBe('')
  })
})
