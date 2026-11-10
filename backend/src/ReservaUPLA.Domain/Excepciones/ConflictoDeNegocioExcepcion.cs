namespace ReservaUPLA.Domain.Excepciones;

// La operación choca con el estado actual de los datos: el ambiente ya está reservado en ese horario (RN-01)
// o la reserva ya no admite ese cambio de estado (RN-06). La API la traduce a 409 Conflict.
public sealed class ConflictoDeNegocioExcepcion : Exception
{
    public ConflictoDeNegocioExcepcion(string mensaje) : base(mensaje)
    {
    }
}
