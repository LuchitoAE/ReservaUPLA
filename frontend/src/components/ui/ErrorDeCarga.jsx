import { avisoDeError } from '../../utils/avisoDeError'
import { AlertMessage } from './AlertMessage'
import { Button } from './Button'
import { EstadoVacio } from './EstadoVacio'
import { Icono } from './Icono'

// Error al cargar una lista o un panel. Sin conexión ocupa el lugar del contenido con el estado vacío del diseño C05;
// los demás se explican con un aviso y el botón «Reintentar» debajo (C04). «titulo» y «mensaje» dejan que la página
// diga qué no se pudo cargar («No se pudieron cargar los indicadores.») en vez del título general.
export function ErrorDeCarga({ error, alReintentar, titulo, mensaje }) {
  const boton = alReintentar && (
    <Button onClick={alReintentar} variante="enlace-borde">
      <Icono nombre="reintentar" />
      Reintentar
    </Button>
  )

  if (error?.tipo === 'sin_conexion') {
    return (
      <div className="rounded-xl border border-borde bg-superficie shadow-tarjeta">
        <EstadoVacio
          icono="sin-conexion"
          titulo="No se pudo conectar con el servidor."
          texto="Revise su conexión e inténtelo de nuevo."
          accion={boton}
        />
      </div>
    )
  }

  const aviso = avisoDeError(error)

  return (
    <div className="flex flex-col items-start gap-4">
      <AlertMessage tipo="error" titulo={titulo ?? aviso.titulo} className="self-stretch">
        {mensaje ?? aviso.mensaje}
      </AlertMessage>
      {boton}
    </div>
  )
}
