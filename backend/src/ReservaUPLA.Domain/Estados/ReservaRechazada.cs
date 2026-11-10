using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Rechazada: estado final. RN-06: una reserva rechazada no podrá modificarse.
public sealed class ReservaRechazada : EstadoDeReserva
{
    public override Estados_Reserva Valor => Estados_Reserva.Rechazada;

    public override IReadOnlyList<Estados_Reserva> Siguientes { get; } = [];

    protected override string MotivoDeNoPermitir(Estados_Reserva destino) =>
        "Una reserva rechazada no puede modificarse. Si aún necesita el ambiente, registre una nueva solicitud.";
}
