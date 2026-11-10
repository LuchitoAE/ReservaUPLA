using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Domain.Entidades;

// Un paso en la vida de una reserva (RF-06): a qué estado pasó, cuándo y quién lo hizo. Solo lo crea la reserva, al
// registrarse (Pendiente, por el solicitante) y en cada cambio de estado; nunca se modifica.
// Id_Usuario es nulo solo en las entradas que la migración CrearHistoriales cargó para cambios anteriores al
// historial: de esos no se sabe quién los hizo y no se inventa.
public sealed class Historial
{
    private Historial()
    {
    }

    public Guid Id_Historial { get; private set; }

    public Guid Id_Reserva { get; private set; }

    public Estados_Reserva Estado_Historial { get; private set; }

    public DateTime Fecha_Historial { get; private set; }

    public Guid? Id_Usuario { get; private set; }

    internal static Historial Registrar(Guid id_reserva, Estados_Reserva estado, Guid id_usuario, DateTime fecha_utc) => new()
    {
        Id_Historial = Guid.CreateVersion7(),
        Id_Reserva = id_reserva,
        Estado_Historial = estado,
        Fecha_Historial = fecha_utc,
        Id_Usuario = id_usuario,
    };
}
