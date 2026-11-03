import { normalizarLinea } from '../utils/normalizarTexto'
import { crearValidador, longitud, requerido, texto } from './validaciones'

// Reglas del formulario de ambiente (RF-02), iguales a las de Domain/Entities/Ambiente.cs.
export const AMBIENTE = { nombreMaximo: 100, ubicacionMaximo: 100, capacidadMinima: 1, capacidadMaxima: 1000 }

export const reglasDeAmbiente = crearValidador({
  nombre_ambiente: (valor) =>
    texto(valor, {
      nombre: 'El nombre',
      minimo: 3,
      maximo: AMBIENTE.nombreMaximo,
      obligatorio: 'Escriba el nombre del ambiente, por ejemplo «Laboratorio de cómputo 1».',
    }),
  tipo_ambiente: (valor) => requerido(valor, 'Elija el tipo de ambiente.'),
  capacidad_ambiente: (valor) => {
    const vacio = requerido(valor, 'Indique cuántas personas caben en el ambiente.')
    if (vacio) {
      return vacio
    }
    const numero = Number(valor)
    return Number.isInteger(numero) && numero >= AMBIENTE.capacidadMinima && numero <= AMBIENTE.capacidadMaxima
      ? null
      : `La capacidad debe ser un número entero entre ${AMBIENTE.capacidadMinima} y ${AMBIENTE.capacidadMaxima} personas.`
  },
  ubicacion_ambiente: (valor) => {
    const ubicacion = normalizarLinea(valor)
    return (
      requerido(ubicacion, 'Indique dónde está: pabellón, piso o aula.') ??
      longitud(ubicacion, { nombre: 'La ubicación', minimo: 3, maximo: AMBIENTE.ubicacionMaximo })
    )
  },
  estado_ambiente: (valor) => requerido(valor, 'Elija el estado del ambiente.'),
})

// Lo que se envía: textos normalizados, la capacidad como número y el responsable solo si se eligió.
export function normalizarAmbiente(valores) {
  return {
    nombre_ambiente: normalizarLinea(valores.nombre_ambiente),
    tipo_ambiente: valores.tipo_ambiente,
    capacidad_ambiente: Number(valores.capacidad_ambiente),
    ubicacion_ambiente: normalizarLinea(valores.ubicacion_ambiente),
    estado_ambiente: valores.estado_ambiente,
    id_responsable_ambiente: valores.id_responsable_ambiente || null,
  }
}
