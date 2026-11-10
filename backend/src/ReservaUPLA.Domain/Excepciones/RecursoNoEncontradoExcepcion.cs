namespace ReservaUPLA.Domain.Excepciones;

// Se pidió operar sobre algo que no existe (una reserva con un identificador desconocido).
// La API la traduce a 404 Not Found.
public sealed class RecursoNoEncontradoExcepcion : Exception
{
    public RecursoNoEncontradoExcepcion(string mensaje) : base(mensaje)
    {
    }
}
