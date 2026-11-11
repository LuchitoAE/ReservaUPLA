using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Un paso en la vida de una reserva (RF-06): a qué estado pasó, cuándo y quién lo hizo. Solo lo crea la reserva, al
// registrarse (Pendiente, por el solicitante) y en cada cambio de estado; nunca se modifica.
// IdUsuario es nulo solo en las entradas que la migración CrearHistoriales cargó para cambios anteriores al
// historial: de esos no se sabe quién los hizo y no se inventa.
public sealed class Historial
{
    private Historial()
    {
    }

    public Guid IdHistorial { get; private set; }

    public Guid IdReserva { get; private set; }

    public EstadoReserva EstadoHistorial { get; private set; }

    public DateTime FechaHistorial { get; private set; }

    public Guid? IdUsuario { get; private set; }

    internal static Historial Registrar(Guid idReserva, EstadoReserva estado, Guid idUsuario, DateTime fechaUtc) => new()
    {
        IdHistorial = Guid.CreateVersion7(),
        IdReserva = idReserva,
        EstadoHistorial = estado,
        FechaHistorial = fechaUtc,
        IdUsuario = idUsuario,
    };
}
