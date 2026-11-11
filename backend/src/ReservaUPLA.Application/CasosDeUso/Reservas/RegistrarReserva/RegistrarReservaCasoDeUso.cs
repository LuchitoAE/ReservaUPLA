using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.RegistrarReserva;

// RF-03 y RF-04: busca al solicitante y al ambiente, deja que la entidad valide los datos, revisa la disponibilidad
// con la agenda de ese día y, solo entonces, pide el correlativo y guarda. Toda reserva nace Pendiente.
public sealed class RegistrarReservaCasoDeUso
{
    private readonly IRepositorioDeReservas _repositorioDeReservas;
    private readonly IRepositorioDeUsuarios _repositorioDeUsuarios;
    private readonly IRepositorioDeAmbientes _repositorioDeAmbientes;
    private readonly IReloj _reloj;

    public RegistrarReservaCasoDeUso(
        IRepositorioDeReservas repositorioDeReservas,
        IRepositorioDeUsuarios repositorioDeUsuarios,
        IRepositorioDeAmbientes repositorioDeAmbientes,
        IReloj reloj)
    {
        _repositorioDeReservas = repositorioDeReservas;
        _repositorioDeUsuarios = repositorioDeUsuarios;
        _repositorioDeAmbientes = repositorioDeAmbientes;
        _reloj = reloj;
    }

    // «idUsuarioSesion»: quien inició sesión; él es el solicitante.
    public async Task<DetalleDeReserva> EjecutarAsync(
        RegistrarReservaComando comando, Guid idUsuarioSesion, CancellationToken cancelacion = default)
    {
        var solicitante = await _repositorioDeUsuarios.ObtenerPorIdAsync(idUsuarioSesion, cancelacion);
        var ambiente = comando.IdAmbiente is { } idAmbiente
            ? await _repositorioDeAmbientes.ObtenerPorIdAsync(idAmbiente, cancelacion)
            : null;

        var momento = _reloj.Ahora;

        // Si algún dato falla, Solicitar lanza DatosNoValidosExcepcion con todos los errores.
        var reserva = Reserva.Solicitar(new DatosDeSolicitud(
            solicitante,
            ambiente,
            comando.FechaReserva,
            comando.HoraInicioReserva,
            comando.HoraFinReserva,
            comando.MotivoReserva,
            momento));

        // RF-04: antes de registrar, que no choque con una reserva aprobada (RN-01).
        var reservasDelDia = await _repositorioDeReservas.ListarDelAmbienteEnLaFechaAsync(
            reserva.IdAmbiente, reserva.FechaReserva, cancelacion);
        reserva.VerificarDisponibilidad(Agenda.De(reservasDelDia));

        reserva.AsignarCodigo(
            await _repositorioDeReservas.ObtenerSiguienteNumeroAsync(cancelacion), momento.FechaEnPeru);
        await _repositorioDeReservas.AgregarAsync(reserva, cancelacion);

        // Recién registrada, su historial tiene una sola entrada: Pendiente, por quien la solicitó.
        var historial = reserva.HistorialReserva
            .Select(entrada => new DatosDeHistorial(
                entrada.EstadoHistorial,
                entrada.FechaHistorial,
                entrada.IdUsuario,
                solicitante!.NombreCompletoUsuario))
            .ToList();

        return DetalleDeReserva.DesdeEntidades(reserva, solicitante!, ambiente!, historial);
    }
}
