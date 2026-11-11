using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Objeto de valor con las reservas de un mismo ambiente y una misma fecha, ya filtradas por quien consulta.
// La agenda no vuelve a filtrar por ambiente ni por fecha: es su contrato recibir ese conjunto acotado.
// Guarda una copia para que nadie la altere después de armarla.
public sealed class Agenda
{
    private readonly Reserva[] _reservas;

    private Agenda(IEnumerable<Reserva> reservas)
    {
        _reservas = reservas.ToArray();
    }

    public static Agenda De(IEnumerable<Reserva> reservasDelAmbienteEnLaFecha) => new(reservasDelAmbienteEnLaFecha);

    public IReadOnlyList<Reserva> Reservas => Array.AsReadOnly(_reservas);

    // RN-01: la primera reserva aprobada que se superpone con el horario, sin contar la que se está revisando.
    public Reserva? CruceAprobadoCon(Horario horario, Guid? excepto = null) =>
        _reservas.FirstOrDefault(reserva =>
            reserva.IdReserva != excepto
            && reserva.EstadoReserva == EstadoReserva.Aprobada
            && reserva.ObtenerHorario().SeCruzaCon(horario));
}
