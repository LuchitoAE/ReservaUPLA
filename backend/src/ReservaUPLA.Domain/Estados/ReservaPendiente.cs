using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Toda reserva nace Pendiente: espera que un administrador la apruebe o la rechace, o que se cancele.
public sealed class ReservaPendiente : EstadoDeReserva
{
    public override Estados_Reserva Valor => Estados_Reserva.Pendiente;

    public override IReadOnlyList<Estados_Reserva> Siguientes { get; } =
        [Estados_Reserva.Aprobada, Estados_Reserva.Rechazada, Estados_Reserva.Cancelada];

    protected override string MotivoDeNoPermitir(Estados_Reserva destino) => "La reserva ya está pendiente.";
}
