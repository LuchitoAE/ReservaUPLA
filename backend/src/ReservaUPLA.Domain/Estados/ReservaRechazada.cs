using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Rechazada: estado final. RN-06: una reserva rechazada no podrá modificarse.
public sealed class ReservaRechazada : EstadoDeReserva
{
    public override EstadoReserva Valor => EstadoReserva.Rechazada;

    public override IReadOnlyList<EstadoReserva> Siguientes { get; } = [];

    protected override string MotivoDeNoPermitir(EstadoReserva destino) =>
        "Una reserva rechazada no puede modificarse. Si aún necesita el ambiente, registre una nueva solicitud.";
}
