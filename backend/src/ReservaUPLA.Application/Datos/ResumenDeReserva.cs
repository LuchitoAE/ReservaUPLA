using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Una fila del listado de reservas (RF-05): lo necesario para ubicar una reserva de un vistazo, con los nombres del
// ambiente y del solicitante en lugar de sus identificadores. El detalle completo va en DetalleDeReserva.
public sealed record ResumenDeReserva(
    Guid IdReserva,
    string CodigoReserva,
    DateOnly FechaReserva,
    TimeOnly HoraInicioReserva,
    TimeOnly HoraFinReserva,
    EstadoReserva EstadoReserva,
    Guid IdAmbiente,
    string NombreAmbiente,
    Guid IdUsuario,
    string NombreCompletoUsuario);
