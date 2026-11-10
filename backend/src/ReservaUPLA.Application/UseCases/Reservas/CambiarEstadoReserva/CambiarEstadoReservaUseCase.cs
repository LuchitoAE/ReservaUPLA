using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.UseCases.Reservas.CambiarEstadoReserva;

// RF-07: busca la reserva y a quien hace el cambio, trae las reservas del mismo ambiente y día (para RN-01 al aprobar)
// y deja que la entidad decida a través de su estado actual (RN-05, RN-06). Devuelve el detalle ya actualizado.
public sealed class CambiarEstadoReservaUseCase
{
    private readonly IReservaRepository _reserva_repository;
    private readonly IUsuarioRepository _usuario_repository;
    private readonly IConsultaDeReservas _consulta_de_reservas;
    private readonly IReloj _reloj;

    public CambiarEstadoReservaUseCase(
        IReservaRepository reserva_repository,
        IUsuarioRepository usuario_repository,
        IConsultaDeReservas consulta_de_reservas,
        IReloj reloj)
    {
        _reserva_repository = reserva_repository;
        _usuario_repository = usuario_repository;
        _consulta_de_reservas = consulta_de_reservas;
        _reloj = reloj;
    }

    public async Task<ReservaDetalleDto> EjecutarAsync(
        Guid id_reserva, CambiarEstadoReservaCommand comando, Guid id_usuario_sesion, CancellationToken cancelacion = default)
    {
        var reserva = await _reserva_repository.ObtenerPorIdAsync(id_reserva, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe una reserva con el identificador indicado.");

        var usuario = await _usuario_repository.ObtenerPorIdAsync(id_usuario_sesion, cancelacion);

        var reservas_del_dia = await _reserva_repository.ListarDelAmbienteEnLaFechaAsync(reserva.Id_Ambiente, reserva.Fecha_Reserva, cancelacion);

        reserva.CambiarEstado(comando.Estado_Reserva, usuario, reservas_del_dia, _reloj.AhoraUtc);

        await _reserva_repository.GuardarCambiosAsync(cancelacion);

        return (await _consulta_de_reservas.ObtenerDetalleAsync(id_reserva, cancelacion))!;
    }
}
