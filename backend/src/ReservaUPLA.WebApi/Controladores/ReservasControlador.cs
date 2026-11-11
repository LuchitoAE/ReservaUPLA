using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using ReservaUPLA.Application.CasosDeUso.Reservas.CambiarEstadoReserva;
using ReservaUPLA.Application.CasosDeUso.Reservas.ConsultarDisponibilidad;
using ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controladores;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch: de los errores se encarga
// ManejadorDeErrores (400 datos, 401 sin sesión, 403 rol, 404 no existe, 409 choca con otra reserva o con el estado).
// El solicitante y quien cambia el estado son siempre el usuario de la sesión.
[ApiController]
[Controller]
[Route("api/reservas")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class ReservasControlador : ControllerBase
{
    // RF-03: registrar una solicitud de reserva. Nace Pendiente; Location apunta a su detalle.
    [HttpPost]
    [ProducesResponseType<RespuestaApi<DetalleDeReserva>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DetalleDeReserva>>> Registrar(
        RegistrarReservaComando comando,
        [FromServices] RegistrarReservaCasoDeUso casoDeUso,
        CancellationToken cancelacion)
    {
        var reserva = await casoDeUso.EjecutarAsync(comando, User.IdUsuario(), cancelacion);

        return CreatedAtAction(
            nameof(ObtenerDetalle),
            new { id_reserva = reserva.IdReserva },
            RespuestaApi.Exito(reserva, $"Reserva {reserva.CodigoReserva} registrada: queda pendiente de aprobación."));
    }

    // RF-05: listar las reservas registradas, con filtros opcionales.
    [HttpGet]
    [ProducesResponseType<RespuestaApi<IReadOnlyList<ResumenDeReserva>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<IReadOnlyList<ResumenDeReserva>>>> Listar(
        [FromServices] IConsultaDeReservas consulta,
        CancellationToken cancelacion,
        [FromQuery(Name = "estado_reserva")] EstadoReserva? estadoReserva = null,
        [FromQuery(Name = "id_ambiente")] Guid? idAmbiente = null,
        [FromQuery(Name = "fecha_reserva")] DateOnly? fechaReserva = null,
        [FromQuery(Name = "id_usuario")] Guid? idUsuario = null,
        [FromQuery(Name = "id_responsable_ambiente")] Guid? idResponsableAmbiente = null,
        [FromQuery(Name = "fecha_desde")] DateOnly? fechaDesde = null,
        [FromQuery(Name = "fecha_hasta")] DateOnly? fechaHasta = null,
        [FromQuery(Name = "texto")] string? texto = null)
    {
        var filtro = new FiltroDeReservas(
            estadoReserva, idAmbiente, fechaReserva, idUsuario, idResponsableAmbiente, fechaDesde, fechaHasta, texto);
        var reservas = await consulta.ListarAsync(filtro, cancelacion);

        return RespuestaApi.Exito(reservas, reservas.Count == 1 ? "1 reserva." : $"{reservas.Count} reservas.");
    }

    // RF-06: consultar el detalle de una reserva.
    [HttpGet("{id_reserva:guid}")]
    [ProducesResponseType<RespuestaApi<DetalleDeReserva>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DetalleDeReserva>>> ObtenerDetalle(
        [FromRoute(Name = "id_reserva")] Guid idReserva,
        [FromServices] IConsultaDeReservas consulta,
        CancellationToken cancelacion)
    {
        var reserva = await consulta.ObtenerDetalleAsync(idReserva, cancelacion);

        if (reserva is null)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Reserva no encontrada.",
                detail: "No existe una reserva con el identificador indicado.");
        }

        return RespuestaApi.Exito(reserva, $"Reserva {reserva.CodigoReserva}.");
    }

    // RF-07: cambiar el estado (Aprobada, Rechazada o Cancelada). 403 si el rol no lo permite (RN-05); 409 si el
    // estado actual no lo admite (RN-06) o si al aprobar choca con otra aprobada (RN-01).
    [HttpPatch("{id_reserva:guid}/estado")]
    [ProducesResponseType<RespuestaApi<DetalleDeReserva>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DetalleDeReserva>>> CambiarEstado(
        [FromRoute(Name = "id_reserva")] Guid idReserva,
        CambiarEstadoReservaComando comando,
        [FromServices] CambiarEstadoReservaCasoDeUso casoDeUso,
        CancellationToken cancelacion)
    {
        var reserva = await casoDeUso.EjecutarAsync(idReserva, comando, User.IdUsuario(), cancelacion);

        return RespuestaApi.Exito(reserva, $"Reserva {reserva.CodigoReserva}: ahora está {reserva.EstadoReserva}.");
    }

    // RF-04: ¿está libre el ambiente en ese horario? El formulario lo consulta antes de enviar.
    [HttpGet("disponibilidad")]
    [ProducesResponseType<RespuestaApi<DatosDeDisponibilidad>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DatosDeDisponibilidad>>> ConsultarDisponibilidad(
        [FromQuery(Name = "id_ambiente"), BindRequired] Guid idAmbiente,
        [FromQuery(Name = "fecha_reserva"), BindRequired] DateOnly fechaReserva,
        [FromQuery(Name = "hora_inicio_reserva"), BindRequired] TimeOnly horaInicioReserva,
        [FromQuery(Name = "hora_fin_reserva"), BindRequired] TimeOnly horaFinReserva,
        [FromServices] ConsultarDisponibilidadCasoDeUso casoDeUso,
        CancellationToken cancelacion)
    {
        var disponibilidad = await casoDeUso.EjecutarAsync(
            idAmbiente, fechaReserva, horaInicioReserva, horaFinReserva, cancelacion);

        return RespuestaApi.Exito(disponibilidad, disponibilidad.Mensaje);
    }
}
