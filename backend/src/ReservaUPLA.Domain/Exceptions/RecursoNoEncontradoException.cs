namespace ReservaUPLA.Domain.Exceptions;

// Se pidió operar sobre algo que no existe (una reserva con un identificador desconocido).
// La API la traduce a 404 Not Found.
public sealed class RecursoNoEncontradoException : Exception
{
    public RecursoNoEncontradoException(string mensaje) : base(mensaje)
    {
    }
}
