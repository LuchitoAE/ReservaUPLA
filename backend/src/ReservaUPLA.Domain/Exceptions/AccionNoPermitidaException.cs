namespace ReservaUPLA.Domain.Exceptions;

// El usuario no tiene el rol que la operación exige (RN-05: solo el administrador aprueba o rechaza).
// La API la traduce a 403 Forbidden.
public sealed class AccionNoPermitidaException : Exception
{
    public AccionNoPermitidaException(string mensaje) : base(mensaje)
    {
    }
}
