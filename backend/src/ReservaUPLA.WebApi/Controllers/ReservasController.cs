using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.UseCases.Reservas.CambiarEstadoReserva;
using ReservaUPLA.Application.UseCases.Reservas.ConsultarDisponibilidad;
using ReservaUPLA.Application.UseCases.Reservas.RegistrarReserva;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controllers;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch: de los errores se encarga
// ManejadorDeErrores (400 datos, 401 sin sesión, 403 rol, 404 no existe, 409 choca con otra reserva o con el estado).
// El solicitante y quien cambia el estado son siempre el usuario de la sesión.
[ApiController]
[Route("api/reservas")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class ReservasController : ControllerBase
{
    // RF-03: registrar una solicitud de reserva. Nace Pendiente; Location apunta a su detalle.
    [HttpPost]
    [ProducesResponseType<RespuestaApi<ReservaDetalleDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<ReservaDetalleDto>>> Registrar(
        RegistrarReservaCommand comando,
        [FromServices] RegistrarReservaUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var reserva = await caso_de_uso.EjecutarAsync(comando, User.IdUsuario(), cancelacion);

        return CreatedAtAction(
            nameof(ObtenerDetalle),
            new { id_reserva = reserva.Id_Reserva },
            RespuestaApi.Exito(reserva, $"Reserva {reserva.Codigo_Reserva} registrada: queda pendiente de aprobación."));
    }

    // RF-05: listar las reservas registradas, con filtros opcionales.
    [HttpGet]
    [ProducesResponseType<RespuestaApi<IReadOnlyList<ReservaResumenDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<IReadOnlyList<ReservaResumenDto>>>> Listar(
        [FromServices] IConsultaDeReservas consulta,
        CancellationToken cancelacion,
        [FromQuery] Estados_Reserva? estado_reserva = null,
        [FromQuery] Guid? id_ambiente = null,
        [FromQuery] DateOnly? fecha_reserva = null,
        [FromQuery] Guid? id_usuario = null,
        [FromQuery] Guid? id_responsable_ambiente = null)
    {
        var filtro = new FiltroDeReservas(estado_reserva, id_ambiente, fecha_reserva, id_usuario, id_responsable_ambiente);
        var reservas = await consulta.ListarAsync(filtro, cancelacion);

        return RespuestaApi.Exito(reservas, reservas.Count == 1 ? "1 reserva." : $"{reservas.Count} reservas.");
    }

    // RF-06: consultar el detalle de una reserva.
    [HttpGet("{id_reserva:guid}")]
    [ProducesResponseType<RespuestaApi<ReservaDetalleDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<ReservaDetalleDto>>> ObtenerDetalle(
        Guid id_reserva,
        [FromServices] IConsultaDeReservas consulta,
        CancellationToken cancelacion)
    {
        var reserva = await consulta.ObtenerDetalleAsync(id_reserva, cancelacion);

        if (reserva is null)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Reserva no encontrada.",
                detail: "No existe una reserva con el identificador indicado.");
        }

        return RespuestaApi.Exito(reserva, $"Reserva {reserva.Codigo_Reserva}.");
    }

    // RF-07: cambiar el estado (Aprobada, Rechazada o Cancelada). 403 si el rol no lo permite (RN-05); 409 si el
    // estado actual no lo admite (RN-06) o si al aprobar choca con otra aprobada (RN-01).
    [HttpPatch("{id_reserva:guid}/estado")]
    [ProducesResponseType<RespuestaApi<ReservaDetalleDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<ReservaDetalleDto>>> CambiarEstado(
        Guid id_reserva,
        CambiarEstadoReservaCommand comando,
        [FromServices] CambiarEstadoReservaUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var reserva = await caso_de_uso.EjecutarAsync(id_reserva, comando, User.IdUsuario(), cancelacion);

        return RespuestaApi.Exito(reserva, $"Reserva {reserva.Codigo_Reserva}: ahora está {reserva.Estado_Reserva}.");
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
