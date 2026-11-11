using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Patrón Factory: entrega el objeto de estado que corresponde al valor guardado en la base (EstadoReserva).
// Quien lo usa no conoce las clases concretas, solo la clase base EstadoDeReserva. Los estados no guardan datos,
// así que se crea una sola instancia de cada uno y se reutiliza.
public static class FabricaDeEstadosDeReserva
{
    private static readonly IReadOnlyDictionary<EstadoReserva, EstadoDeReserva> EstadosPorValor =
        new Dictionary<EstadoReserva, EstadoDeReserva>
        {
            [EstadoReserva.Pendiente] = new ReservaPendiente(),
            [EstadoReserva.Aprobada] = new ReservaAprobada(),
            [EstadoReserva.Rechazada] = new ReservaRechazada(),
            [EstadoReserva.Cancelada] = new ReservaCancelada(),
        };

    public static EstadoDeReserva Crear(EstadoReserva estado) =>
        EstadosPorValor.TryGetValue(estado, out var estadoDeReserva)
            ? estadoDeReserva
            : throw new ArgumentOutOfRangeException(nameof(estado), estado, "Estado de reserva desconocido.");
}
