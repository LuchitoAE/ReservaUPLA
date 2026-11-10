using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.CasosDeUso.Panel.ObtenerIndicadores;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controladores;

// RF-08 y RF-12: indicadores del panel principal, según el rol del usuario de la sesión. No recibe filtros: nadie ve
// por aquí lo que no le toca.
[ApiController]
[Controller]
[Route("api/panel")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class PanelControlador : ControllerBase
{
    [HttpGet("indicadores")]
    [ProducesResponseType<RespuestaApi<DatosDeIndicadores>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<RespuestaApi<DatosDeIndicadores>>> ObtenerIndicadores(
        [FromServices] ObtenerIndicadoresDelPanelCasoDeUso caso_de_uso,
        CancellationToken cancelacion)
    {
        var indicadores = await caso_de_uso.EjecutarAsync(User.IdUsuario(), cancelacion);

        return RespuestaApi.Exito(indicadores, $"Indicadores de {indicadores.Total_Reservas} reservas.");
    }
}
