using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Cancelada: estado final. Volver a activarla exigiría revisar otra vez la disponibilidad: se pide una nueva.
public sealed class ReservaCancelada : EstadoDeReserva
{
    public override EstadoReserva Valor => EstadoReserva.Cancelada;

    public override IReadOnlyList<EstadoReserva> Siguientes { get; } = [];

    protected override string MotivoDeNoPermitir(EstadoReserva destino) =>
        "Una reserva cancelada ya no cambia de estado. Si aún necesita el ambiente, registre una nueva solicitud.";
}
