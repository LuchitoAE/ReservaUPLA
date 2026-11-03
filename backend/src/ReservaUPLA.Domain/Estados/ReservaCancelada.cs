using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Estados;

// Cancelada: estado final. Volver a activarla exigiría revisar otra vez la disponibilidad: se pide una nueva.
public sealed class ReservaCancelada : EstadoDeReserva
{
    public override Estados_Reserva Valor => Estados_Reserva.Cancelada;

    public override IReadOnlyList<Estados_Reserva> Siguientes { get; } = [];

    protected override string MotivoDeNoPermitir(Estados_Reserva destino) =>
        "Una reserva cancelada ya no cambia de estado. Si aún necesita el ambiente, registre una nueva solicitud.";
}
