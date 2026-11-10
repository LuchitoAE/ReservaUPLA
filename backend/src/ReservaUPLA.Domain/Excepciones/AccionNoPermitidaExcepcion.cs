namespace ReservaUPLA.Domain.Excepciones;

// El usuario no tiene el rol que la operación exige (RN-05: solo el administrador aprueba o rechaza).
// La API la traduce a 403 Forbidden.
public sealed class AccionNoPermitidaExcepcion : Exception
{
    public AccionNoPermitidaExcepcion(string mensaje) : base(mensaje)
    {
    }
}
