using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Estados;

// Toda reserva nace Pendiente: espera que un administrador la apruebe o la rechace, o que se cancele.
public sealed class ReservaPendiente : EstadoDeReserva
{
    public override EstadoReserva Valor => EstadoReserva.Pendiente;

    public override IReadOnlyList<EstadoReserva> Siguientes { get; } =
        [EstadoReserva.Aprobada, EstadoReserva.Rechazada, EstadoReserva.Cancelada];

    protected override string MotivoDeNoPermitir(EstadoReserva destino) => "La reserva ya está pendiente.";
}
