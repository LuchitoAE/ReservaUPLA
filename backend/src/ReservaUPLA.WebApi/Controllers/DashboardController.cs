using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.WebApi.Respuestas;

namespace ReservaUPLA.WebApi.Controllers;

// RF-08: indicadores básicos de reservas para el dashboard.
[ApiController]
[Route("api/dashboard")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class DashboardController : ControllerBase
{
    [HttpGet("indicadores")]
    [ProducesResponseType<RespuestaApi<IndicadoresDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<RespuestaApi<IndicadoresDto>>> ObtenerIndicadores(
        [FromServices] IConsultaDeIndicadores consulta,
        CancellationToken cancelacion)
    {
        var indicadores = await consulta.ObtenerAsync(cancelacion);

        return RespuestaApi.Exito(indicadores, $"Indicadores de {indicadores.Total_Reservas} reservas.");
    }
}
