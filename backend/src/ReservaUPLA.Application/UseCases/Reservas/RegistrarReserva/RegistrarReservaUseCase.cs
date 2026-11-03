using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.UseCases.Reservas.RegistrarReserva;

// RF-03 y RF-04: busca al solicitante y al ambiente, deja que la entidad valide los datos, revisa la disponibilidad
// con las reservas de ese día y, solo entonces, pide el correlativo y guarda. Toda reserva nace Pendiente.
public sealed class RegistrarReservaUseCase
{
    private readonly IReservaRepository _reserva_repository;
    private readonly IUsuarioRepository _usuario_repository;
    private readonly IAmbienteRepository _ambiente_repository;
    private readonly IReloj _reloj;

    public RegistrarReservaUseCase(
        IReservaRepository reserva_repository,
        IUsuarioRepository usuario_repository,
        IAmbienteRepository ambiente_repository,
        IReloj reloj)
    {
        _reserva_repository = reserva_repository;
        _usuario_repository = usuario_repository;
        _ambiente_repository = ambiente_repository;
        _reloj = reloj;
    }

    public async Task<ReservaDetalleDto> EjecutarAsync(RegistrarReservaCommand comando, CancellationToken cancelacion = default)
    {
        var solicitante = comando.Id_Usuario is { } id_usuario
            ? await _usuario_repository.ObtenerPorIdAsync(id_usuario, cancelacion)
            : null;
        var ambiente = comando.Id_Ambiente is { } id_ambiente
            ? await _ambiente_repository.ObtenerPorIdAsync(id_ambiente, cancelacion)
            : null;

        // Si algún dato falla, Solicitar lanza DatosNoValidosException con todos los errores.
        var reserva = Reserva.Solicitar(
            solicitante,
            ambiente,
            comando.Fecha_Reserva,
            comando.Hora_Inicio_Reserva,
            comando.Hora_Fin_Reserva,
            comando.Motivo_Reserva,
            _reloj.AhoraEnPeru,
            _reloj.AhoraUtc);

        // RF-04: antes de registrar, que no choque con una reserva aprobada (RN-01).
        var reservas_del_dia = await _reserva_repository.ListarDelAmbienteEnLaFechaAsync(reserva.Id_Ambiente, reserva.Fecha_Reserva, cancelacion);
        reserva.VerificarDisponibilidad(reservas_del_dia);

        reserva.AsignarCodigo(await _reserva_repository.ObtenerSiguienteNumeroAsync(cancelacion));
        await _reserva_repository.AgregarAsync(reserva, cancelacion);

        return ReservaDetalleDto.DesdeEntidades(reserva, solicitante!, ambiente!);
    }
}
