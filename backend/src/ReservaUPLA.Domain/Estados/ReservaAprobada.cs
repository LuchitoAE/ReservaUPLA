using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Aprobada: el ambiente queda ocupado en ese horario (RN-01). Solo puede cancelarse.
public sealed class ReservaAprobada : EstadoDeReserva
{
    public override EstadoReserva Valor => EstadoReserva.Aprobada;

    public override IReadOnlyList<EstadoReserva> Siguientes { get; } = [EstadoReserva.Cancelada];

    protected override string MotivoDeNoPermitir(EstadoReserva destino) =>
        destino == EstadoReserva.Aprobada ? "La reserva ya está aprobada." : "Una reserva aprobada solo puede cancelarse.";
}
