using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.CambiarEstadoReserva;

// RF-07: busca la reserva y a quien hace el cambio, arma la agenda del mismo ambiente y día (para RN-01 al aprobar)
// y deja que la entidad decida a través de su estado actual (RN-05, RN-06). Devuelve el detalle ya actualizado.
public sealed class CambiarEstadoReservaCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorioDeReservas;
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IConsultaDeReservas _consultaDeReservas;
    private readonly IReloj _reloj;

    public CambiarEstadoReservaCasoDeUso(
        IRepositorioDeReservas repositorioDeReservas,
        IRepositorioDeUsuarios repositorioDeUsuarios,
        IConsultaDeReservas consultaDeReservas,
        IReloj reloj)
    {
        _repositorioDeReservas = repositorioDeReservas;
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _consultaDeReservas = consultaDeReservas;
        _reloj = reloj;
    }

    public async Task<DetalleDeReserva> EjecutarAsync(
        Guid idReserva, CambiarEstadoReservaComando comando, Guid idUsuarioSesion, CancellationToken cancelacion = default)
    {
        var reserva = await _repositorioDeReservas.ObtenerPorIdAsync(idReserva, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe una reserva con el identificador indicado.");

        var usuario = await _repositorioDeUsuarios.ObtenerPorIdAsync(idUsuarioSesion, cancelacion);

        var reservasDelDia = await _repositorioDeReservas.ListarDelAmbienteEnLaFechaAsync(
            reserva.IdAmbiente, reserva.FechaReserva, cancelacion);

        reserva.CambiarEstado(new DatosDeCambioDeEstado(
            comando.EstadoReserva, usuario, Agenda.De(reservasDelDia), _reloj.Ahora));

        await _repositorioDeReservas.GuardarCambiosAsync(cancelacion);

        return (await _consultaDeReservas.ObtenerDetalleAsync(idReserva, cancelacion))!;
    }
}
