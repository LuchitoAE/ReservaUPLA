using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Estados;

// Aprobada: el ambiente queda ocupado en ese horario (RN-01). Solo puede cancelarse.
public sealed class ReservaAprobada : EstadoDeReserva
{
    public override Estados_Reserva Valor => Estados_Reserva.Aprobada;

    public override IReadOnlyList<Estados_Reserva> Siguientes { get; } = [Estados_Reserva.Cancelada];

    protected override string MotivoDeNoPermitir(Estados_Reserva destino) =>
        destino == Estados_Reserva.Aprobada ? "La reserva ya está aprobada." : "Una reserva aprobada solo puede cancelarse.";
}
