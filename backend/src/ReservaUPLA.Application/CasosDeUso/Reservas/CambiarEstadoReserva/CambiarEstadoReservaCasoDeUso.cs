using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.CambiarEstadoReserva;

// RF-07: busca la reserva y a quien hace el cambio, trae las reservas del mismo ambiente y día (para RN-01 al aprobar)
// y deja que la entidad decida a través de su estado actual (RN-05, RN-06). Devuelve el detalle ya actualizado.
public sealed class CambiarEstadoReservaCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorio_de_reservas;
    private readonly IRepositorioDeUsuarios _repositorio_de_usuarios;
    private readonly IConsultaDeReservas _consulta_de_reservas;
    private readonly IReloj _reloj;

    public CambiarEstadoReservaCasoDeUso(
        IRepositorioDeReservas repositorio_de_reservas,
        IRepositorioDeUsuarios repositorio_de_usuarios,
        IConsultaDeReservas consulta_de_reservas,
        IReloj reloj)
    {
        _repositorio_de_reservas = repositorio_de_reservas;
        _repositorio_de_usuarios = repositorio_de_usuarios;
        _consulta_de_reservas = consulta_de_reservas;
        _reloj = reloj;
    }

    public async Task<DetalleDeReserva> EjecutarAsync(
        Guid id_reserva, CambiarEstadoReservaComando comando, Guid id_usuario_sesion, CancellationToken cancelacion = default)
    {
        var reserva = await _repositorio_de_reservas.ObtenerPorIdAsync(id_reserva, cancelacion)
            ?? throw new RecursoNoEncontradoExcepcion("No existe una reserva con el identificador indicado.");

        var usuario = await _repositorio_de_usuarios.ObtenerPorIdAsync(id_usuario_sesion, cancelacion);

        var reservas_del_dia = await _repositorio_de_reservas.ListarDelAmbienteEnLaFechaAsync(reserva.Id_Ambiente, reserva.Fecha_Reserva, cancelacion);

        reserva.CambiarEstado(comando.Estado_Reserva, usuario, reservas_del_dia, _reloj.AhoraUtc);

        await _repositorio_de_reservas.GuardarCambiosAsync(cancelacion);

        return (await _consulta_de_reservas.ObtenerDetalleAsync(id_reserva, cancelacion))!;
    }
}
