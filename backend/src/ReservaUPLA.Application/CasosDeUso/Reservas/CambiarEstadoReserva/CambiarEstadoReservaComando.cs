using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.CasosDeUso.Reservas.CambiarEstadoReserva;

// Nuevo estado de la reserva. Quién hace el cambio sale de la sesión: con su rol se aplica RN-05.
public sealed record CambiarEstadoReservaComando(Estados_Reserva Estado_Reserva);
