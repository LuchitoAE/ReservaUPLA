using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Reservas.CambiarEstadoReserva;

// Nuevo estado de la reserva y quién hace el cambio (el usuario actual): con su rol se aplica RN-05.
public sealed record CambiarEstadoReservaCommand(Estados_Reserva Estado_Reserva, Guid? Id_Usuario);
