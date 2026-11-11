using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Todo lo que se muestra de una reserva (RF-06): sus datos, los del solicitante y los del ambiente, a qué estados
// puede pasar (lo responde su estado actual, patrón State) y su historial, del más antiguo al más reciente. La
// interfaz no necesita otra consulta.
public sealed record DetalleDeReserva(
    Guid IdReserva,
    string CodigoReserva,
    DateOnly FechaReserva,
    TimeOnly HoraInicioReserva,
    TimeOnly HoraFinReserva,
    string MotivoReserva,
    EstadoReserva EstadoReserva,
    IReadOnlyList<EstadoReserva> EstadosSiguientesReserva,
    DateTime FechaRegistroReserva,
    DateTime? FechaActualizacionReserva,
    Guid IdUsuario,
    string NombreCompletoUsuario,
    string CorreoUsuario,
    string CodigoUsuario,
    RolUsuario RolUsuario,
    Guid IdAmbiente,
    string NombreAmbiente,
    TipoAmbiente TipoAmbiente,
    int CapacidadAmbiente,
    string UbicacionAmbiente,
    IReadOnlyList<DatosDeHistorial> HistorialReserva)
{
    public static DetalleDeReserva DesdeEntidades(
        Reserva reserva, Usuario solicitante, Ambiente ambiente, IReadOnlyList<DatosDeHistorial> historial) => new(
        reserva.IdReserva,
        reserva.CodigoReserva,
        reserva.FechaReserva,
        reserva.HoraInicioReserva,
        reserva.HoraFinReserva,
        reserva.MotivoReserva,
        reserva.EstadoReserva,
        reserva.ObtenerEstado().Siguientes,
        reserva.FechaRegistroReserva,
        reserva.FechaActualizacionReserva,
        solicitante.IdUsuario,
        solicitante.NombreCompletoUsuario,
        solicitante.CorreoUsuario,
        solicitante.CodigoUsuario,
        solicitante.RolUsuario,
        ambiente.IdAmbiente,
        ambiente.NombreAmbiente,
        ambiente.TipoAmbiente,
        ambiente.CapacidadAmbiente,
        ambiente.UbicacionAmbiente,
        historial);
}
