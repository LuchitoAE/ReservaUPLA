using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.UseCases.Ambientes.RegistrarAmbiente;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controllers;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch.
[ApiController]
[Route("api/ambientes")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class AmbientesController : ControllerBase
{
    // RF-02: registrar un ambiente universitario. Solo el administrador.
    [HttpPost]
    [Authorize(Roles = Sesion.Administrador)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden, "application/problem+json")]
    [ProducesResponseType<RespuestaApi<AmbienteDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<AmbienteDto>>> Registrar(
        RegistrarAmbienteCommand comando,
        [FromServices] RegistrarAmbienteUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var ambiente = await caso_de_uso.EjecutarAsync(comando, cancelacion);

        return StatusCode(
            StatusCodes.Status201Created,
            RespuestaApi.Exito(ambiente, $"Ambiente {ambiente.Nombre_Ambiente} registrado correctamente."));
    }

    // Lista de ambientes; con estado_ambiente=Disponible, los que se pueden reservar.
    [HttpGet]
    [ProducesResponseType<RespuestaApi<IReadOnlyList<AmbienteDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<IReadOnlyList<AmbienteDto>>>> Listar(
        [FromServices] IConsultaDeAmbientes consulta,
        CancellationToken cancelacion,
        [FromQuery] Estados_Ambiente? estado_ambiente = null,
        [FromQuery] Guid? id_responsable_ambiente = null)
    {
        var ambientes = await consulta.ListarAsync(estado_ambiente, id_responsable_ambiente, cancelacion);

        return RespuestaApi.Exito(ambientes, $"{ambientes.Count} ambientes.");
    }
}
