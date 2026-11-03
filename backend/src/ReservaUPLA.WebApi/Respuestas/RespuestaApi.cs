namespace ReservaUPLA.WebApi.Respuestas;

// Forma de toda respuesta exitosa: success, message y data.
// Los errores no usan esta clase: van como ProblemDetails (RFC 9457) con success y message como campos extra,
// así el cliente lee siempre «success» y «message», y además recibe el formato estándar de errores.
public sealed record RespuestaApi<T>(bool Success, string Message, T Data);

public static class RespuestaApi
{
    public static RespuestaApi<T> Exito<T>(T datos, string mensaje) => new(true, mensaje, datos);
}
