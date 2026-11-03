using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Estados;

// Patrón Factory: entrega el objeto de estado que corresponde al valor guardado en la base (Estados_Reserva).
// Quien lo usa no conoce las clases concretas, solo la clase base EstadoDeReserva. Los estados no guardan datos,
// así que se crea una sola instancia de cada uno y se reutiliza.
public static class FabricaDeEstadosDeReserva
{
    private static readonly IReadOnlyDictionary<Estados_Reserva, EstadoDeReserva> Estados =
        new Dictionary<Estados_Reserva, EstadoDeReserva>
        {
            [Estados_Reserva.Pendiente] = new ReservaPendiente(),
            [Estados_Reserva.Aprobada] = new ReservaAprobada(),
            [Estados_Reserva.Rechazada] = new ReservaRechazada(),
            [Estados_Reserva.Cancelada] = new ReservaCancelada(),
        };

    public static EstadoDeReserva Crear(Estados_Reserva estado) =>
        Estados.TryGetValue(estado, out var estado_de_reserva)
            ? estado_de_reserva
            : throw new ArgumentOutOfRangeException(nameof(estado), estado, "Estado de reserva desconocido.");
}
