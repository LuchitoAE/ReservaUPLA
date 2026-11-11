using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Los datos de un cambio de estado (RF-07): el destino, quién lo pide, la agenda acotada del ambiente y la fecha
// y hora del cambio. La agenda llega ya filtrada por ambiente y fecha, y el momento es uno solo.
public sealed record DatosDeCambioDeEstado(
    EstadoReserva NuevoEstado,
    Usuario? Usuario,
    Agenda ReservasDelAmbiente,
    MomentoActual Momento);
