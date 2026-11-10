import { obtenerIndicadores } from '../api/panelApi'
import { PanelDelAdministrador } from '../components/panel/PanelDelAdministrador'
import { PanelDelResponsable } from '../components/panel/PanelDelResponsable'
import { PanelDelSolicitante } from '../components/panel/PanelDelSolicitante'
import { IndicadoresDelPanel } from '../components/panel/IndicadoresDelPanel'
import { useConsulta } from '../hooks/useConsulta'
import { useUsuarioActual } from '../hooks/useUsuarioActual'

const PANELES = {
  Solicitante: PanelDelSolicitante,
  ResponsableDeAmbiente: PanelDelResponsable,
  Administrador: PanelDelAdministrador,
}

// RF-08 y RF-12: el panel principal según el rol. Cada uno ve lo que necesita (reconocer antes que recordar, Nielsen):
// el solicitante, sus reservas; el responsable, la agenda de sus ambientes; el administrador, lo que espera su
// aprobación. La API cuenta los indicadores con el alcance del rol (no se puede pedir el de otro).
// Si los indicadores no cargan, el panel no puede mostrar el resto: queda el encabezado y el aviso con «Reintentar»
// (diseño C04), en vez de secciones a medias.
export function PanelPrincipal() {
  const { usuarioActual } = useUsuarioActual()
  const indicadores = useConsulta(() => obtenerIndicadores(), [])
  const Panel = PANELES[usuarioActual.rol_usuario] ?? PanelDelAdministrador

  if (indicadores.error) {
    return <IndicadoresDelPanel rol={usuarioActual.rol_usuario} consulta={indicadores} />
  }

  return <Panel usuario={usuarioActual} indicadores={indicadores} />
}
