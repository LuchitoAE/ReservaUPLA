import { Button } from '../ui/Button'
import { Icono } from '../ui/Icono'
import { esIdentificadorDeReserva } from '../../utils/identificadores'

// Qué muestra la banda azul en cada dirección. Es la fuente por defecto; las páginas pueden sobrescribir el saludo,
// el código o el estado con useBandaDePagina(). Las acciones van dentro de la banda, a la derecha (decisión del
// alumno del 10/11/2026), con el botón blanco sobre el azul.
const DESCRIPCIONES_DE_RESERVAS = {
  Solicitante: 'Solicitudes registradas y su estado. Se abre con las suyas; quite el filtro para ver todas.',
  ResponsableDeAmbiente: 'Solicitudes registradas y su estado. Se abre con las de los ambientes a su cargo.',
  Administrador: 'Todas las reservas del sistema. Use los filtros para encontrar una.',
}

const crear = (texto, destino, icono = 'nueva') => (
  <Button destino={destino} variante="blanco">
    <Icono nombre={icono} />
    {texto}
  </Button>
)

const accionDelPanel = (usuario) => {
  if (usuario?.rol_usuario === 'Administrador') {
    return crear('Ver todas las reservas', '/reservas', 'reservas')
  }
  if (usuario?.rol_usuario === 'ResponsableDeAmbiente') {
    return crear('Reservas de mis ambientes', '/reservas', 'reservas')
  }
  return crear('Ver mis reservas', '/reservas', 'reservas')
}

export function bandaDeRuta(pathname, usuario) {
  if (pathname === '/') {
    const nombre = usuario?.nombre_completo_usuario?.split(' ')[0]
    return {
      titulo: 'Panel principal',
      descripcion: nombre ? `Hola, ${nombre}.` : null,
      accion: accionDelPanel(usuario),
    }
  }

  if (pathname === '/reservas') {
    return {
      titulo: 'Reservas',
      descripcion: DESCRIPCIONES_DE_RESERVAS[usuario?.rol_usuario] ?? DESCRIPCIONES_DE_RESERVAS.Administrador,
      accion: crear('Nueva reserva', '/reservas/nueva'),
    }
  }

  if (pathname === '/reservas/nueva') {
    return {
      titulo: 'Nueva reserva',
      descripcion:
        'Solicite un ambiente para una fecha y un horario entre las 07:00 y las 22:00. Queda a nombre de quien inició sesión.',
    }
  }

  if (pathname === '/ambientes') {
    return {
      titulo: 'Ambientes',
      descripcion: 'Laboratorios, auditorios y salas que se pueden reservar.',
      accion: usuario?.rol_usuario === 'Administrador' ? crear('Nuevo ambiente', '/ambientes/nuevo') : null,
    }
  }

  if (pathname === '/ambientes/nuevo') {
    if (usuario?.rol_usuario !== 'Administrador') {
      return { titulo: 'Acceso restringido', descripcion: 'Esta sección es solo para el administrador del sistema.' }
    }
    return {
      titulo: 'Nuevo ambiente',
      descripcion: 'Registre un laboratorio, un auditorio o una sala para que se pueda reservar.',
    }
  }

  if (pathname === '/usuarios') {
    if (usuario?.rol_usuario !== 'Administrador') {
      return { titulo: 'Acceso restringido', descripcion: 'Esta sección es solo para el administrador del sistema.' }
    }
    return {
      titulo: 'Usuarios',
      descripcion: 'Personas que solicitan, aprueban o supervisan las reservas.',
      accion: crear('Nuevo usuario', '/usuarios/nuevo'),
    }
  }

  if (pathname === '/usuarios/nuevo') {
    if (usuario?.rol_usuario !== 'Administrador') {
      return { titulo: 'Acceso restringido', descripcion: 'Esta sección es solo para el administrador del sistema.' }
    }
    return {
      titulo: 'Nuevo usuario',
      descripcion: 'Registre a una persona con el código que le dio la universidad y elija qué podrá hacer.',
    }
  }

  if (pathname === '/mi-cuenta') {
    return {
      titulo: 'Mi cuenta',
      descripcion: 'Sus datos, su contraseña y las preferencias de este navegador.',
    }
  }

  const detalle = pathname.match(/^\/reservas\/([^/]+)$/)
  if (detalle && detalle[1] !== 'nueva' && esIdentificadorDeReserva(detalle[1])) {
    return {
      titulo: 'Reserva',
      accion: crear('Volver a reservas', '/reservas', 'anterior'),
    }
  }

  return {
    titulo: 'Página no encontrada',
    descripcion: `La dirección ${pathname} no existe en ReservaUPLA.`,
  }
}
