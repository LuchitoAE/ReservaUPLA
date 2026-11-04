namespace ReservaUPLA.Domain.Exceptions;

// Credenciales que no corresponden a un usuario activo, o una sesión que ya no existe. La API la traduce a 401.
// El mensaje nunca dice qué dato falló: así no se revela si un correo está registrado.
public sealed class SesionNoValidaException : Exception
{
    public SesionNoValidaException(string mensaje) : base(mensaje)
    {
    }
}
