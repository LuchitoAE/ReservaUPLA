using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ReservaUPLA.Domain.Excepciones;

namespace ReservaUPLA.WebApi.Middleware;

// Único lugar donde una excepción se convierte en respuesta HTTP; los controladores no llevan try/catch.
//   Datos que no cumplen las reglas          -> 400 con un error por campo.
//   Credenciales o sesión no válidas         -> 401.
//   Rol que no permite la acción (RN-05)     -> 403.
//   No existe lo que se pidió                -> 404.
//   Choca con los datos (RN-01, RN-06)       -> 409.
//   Cualquier otro error                     -> 500 con un mensaje genérico. El detalle técnico va al registro del
//                                               servidor y nunca al cliente: no se exponen consultas, tablas ni rutas.
internal sealed class ManejadorDeErrores : IExceptionHandler
{
    private readonly IProblemDetailsService _problem_details_service;
    private readonly JsonOptions _opciones_json;
    private readonly ILogger<ManejadorDeErrores> _registro;

    public ManejadorDeErrores(
        IProblemDetailsService problem_details_service,
        IOptions<JsonOptions> opciones_json,
        ILogger<ManejadorDeErrores> registro)
    {
        _problem_details_service = problem_details_service;
        _opciones_json = opciones_json.Value;
        _registro = registro;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext contexto, Exception excepcion, CancellationToken cancelacion)
    {
        var problema = excepcion switch
        {
            DatosNoValidosExcepcion datos_no_validos => DatosNoValidos(datos_no_validos),
            SesionNoValidaExcepcion sesion =>
                Problema(StatusCodes.Status401Unauthorized, "No se pudo iniciar sesión.", sesion.Message),
            AccionNoPermitidaExcepcion no_permitida =>
                Problema(StatusCodes.Status403Forbidden, "Acción no permitida para este usuario.", no_permitida.Message),
            RecursoNoEncontradoExcepcion no_encontrado =>
                Problema(StatusCodes.Status404NotFound, "No se encontró lo que se buscaba.", no_encontrado.Message),
            ConflictoDeNegocioExcepcion conflicto =>
                Problema(StatusCodes.Status409Conflict, "La operación choca con los datos registrados.", conflicto.Message),
            _ => ErrorInesperado(contexto, excepcion),
        };

        contexto.Response.StatusCode = problema.Status!.Value;

        // La API solo responde JSON: si el cliente pidió otro formato (Accept: text/plain), el error igual sale en
        // RFC 9457 y con su detalle, en lugar de un «Bad Request» sin explicación.
        contexto.Request.Headers.Accept = "application/problem+json";

        return await _problem_details_service.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = contexto,
            Exception = excepcion,
            ProblemDetails = problema,
        });
    }

    private static ProblemDetails Problema(int estado, string titulo, string detalle) =>
        new() { Status = estado, Title = titulo, Detail = detalle };

    // Las claves llegan con el nombre de la propiedad (Fecha_Reserva) y salen como viajan en el JSON
    // (fecha_reserva): el frontend muestra cada mensaje junto a su campo.
    private ValidationProblemDetails DatosNoValidos(DatosNoValidosExcepcion excepcion)
    {
        var politica = _opciones_json.JsonSerializerOptions.PropertyNamingPolicy;
        var errores = excepcion.Errores.ToDictionary(error => politica?.ConvertName(error.Key) ?? error.Key, error => error.Value);

        return new ValidationProblemDetails(errores)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Hay datos que no cumplen las reglas.",
            Detail = "Revise los campos marcados y vuelva a intentarlo.",
        };
    }

    private ProblemDetails ErrorInesperado(HttpContext contexto, Exception excepcion)
    {
        _registro.LogError(excepcion, "Error no controlado en {Metodo} {Ruta}", contexto.Request.Method, contexto.Request.Path);

        return Problema(
            StatusCodes.Status500InternalServerError,
            "Error interno del servidor.",
            "Ocurrió un error inesperado. Inténtelo de nuevo en unos minutos; si continúa, avise al administrador del sistema.");
    }
}
