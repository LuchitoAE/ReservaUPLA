namespace ReservaUPLA.Domain.Enumeraciones;

// Estados de una reserva (RF-07). Toda reserva nace Pendiente.
public enum EstadoReserva
{
    Pendiente = 1,
    Aprobada = 2,
    Rechazada = 3,
    Cancelada = 4,
}
