using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.UseCases.Reservas.ConsultarDisponibilidad;
using ReservaUPLA.Application.UseCases.Reservas.RegistrarReserva;
using ReservaUPLA.WebApi.Respuestas;

namespace ReservaUPLA.WebApi.Controllers;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch: de los errores se encarga
// ManejadorDeErrores (400 datos, 403 rol, 404 no existe, 409 choca con otra reserva o con el estado).
[ApiController]
[Route("api/reservas")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class ReservasController : ControllerBase
{
    // RF-03: registrar una solicitud de reserva. Nace Pendiente.
    [HttpPost]
    [ProducesResponseType<RespuestaApi<ReservaDetalleDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<ReservaDetalleDto>>> Registrar(
        RegistrarReservaCommand comando,
        [FromServices] RegistrarReservaUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var reserva = await caso_de_uso.EjecutarAsync(comando, cancelacion);

        return StatusCode(
            StatusCodes.Status201Created,
            RespuestaApi.Exito(reserva, $"Reserva {reserva.Codigo_Reserva} registrada: queda pendiente de aprobación."));
    }

    // RF-04: ¿está libre el ambiente en ese horario? El formulario lo consulta antes de enviar.
    [HttpGet("disponibilidad")]
    [ProducesResponseType<RespuestaApi<DisponibilidadDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DisponibilidadDto>>> ConsultarDisponibilidad(
        [FromQuery, BindRequired] Guid id_ambiente,
        [FromQuery, BindRequired] DateOnly fecha_reserva,
        [FromQuery, BindRequired] TimeOnly hora_inicio_reserva,
        [FromQuery, BindRequired] TimeOnly hora_fin_reserva,
        [FromServices] ConsultarDisponibilidadUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var disponibilidad = await caso_de_uso.EjecutarAsync(id_ambiente, fecha_reserva, hora_inicio_reserva, hora_fin_reserva, cancelacion);

        return RespuestaApi.Exito(disponibilidad, disponibilidad.Mensaje);
    }
}
