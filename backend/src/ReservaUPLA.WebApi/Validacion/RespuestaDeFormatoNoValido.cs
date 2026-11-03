using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ReservaUPLA.WebApi.Validacion;

// Cuando el JSON no se puede leer o un valor no es del tipo esperado, ASP.NET responde por su cuenta y en
// inglés antes de llegar al controlador. Aquí se reescribe esa respuesta en español, con el campo tal como
// viaja en el JSON. Sirve para cualquier endpoint: el tipo de cada campo se lee del parámetro de la acción.
internal static class RespuestaDeFormatoNoValido
{
    private const string Campo_Solicitud = "solicitud";

    public static IActionResult Crear(ActionContext contexto)
    {
        var errores = new ModelStateDictionary();

        foreach (var (clave, entrada) in contexto.ModelState)
        {
            if (entrada.Errors.Count == 0)
            {
                continue;
            }

            var campo = clave.TrimStart('$', '.');
            var es_campo = campo.Length > 0 && campo != Campo_Solicitud;

            // En el cuerpo, «could not be converted»: el JSON se leyó, pero el valor no es del tipo del campo.
            // En la dirección (?fecha=…), el error es del parámetro. Cualquier otro error del lector (JSON cortado o
            // mal escrito) es del cuerpo completo, aunque señale el último campo leído.
            var valor_de_otro_tipo = entrada.Errors.Any(error =>
                error.ErrorMessage.Contains("could not be converted", StringComparison.Ordinal)
                || error.ErrorMessage.Contains("is not valid", StringComparison.Ordinal));

            if (valor_de_otro_tipo && es_campo)
            {
                errores.AddModelError(campo, MensajeDeFormato(contexto, campo));
            }
        }

        // Si no se pudo señalar ningún campo, el problema es el cuerpo completo.
        if (errores.Count == 0)
        {
            errores.AddModelError(Campo_Solicitud, "Envíe los datos en formato JSON válido.");
        }

        var fabrica = contexto.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>();
        var problema = fabrica.CreateValidationProblemDetails(
            contexto.HttpContext,
            errores,
            StatusCodes.Status400BadRequest,
            title: "Hay datos con un formato no válido.",
            detail: "Revise los campos marcados y vuelva a intentarlo.");

        return new BadRequestObjectResult(problema) { ContentTypes = { "application/problem+json" } };
    }

    private static string MensajeDeFormato(ActionContext contexto, string campo)
    {
        var tipo = TipoDelCampo(contexto, campo);
        tipo = tipo is null ? null : Nullable.GetUnderlyingType(tipo) ?? tipo;

        if (tipo is { IsEnum: true })
        {
            return $"El valor de {campo} debe ser uno de estos: {string.Join(", ", Enum.GetNames(tipo))}.";
        }

        return tipo switch
        {
            _ when tipo == typeof(Guid) => $"El valor de {campo} debe ser un identificador válido.",
            _ when tipo == typeof(DateOnly) => $"El valor de {campo} debe ser una fecha con el formato AAAA-MM-DD.",
            _ when tipo == typeof(TimeOnly) => $"El valor de {campo} debe ser una hora con el formato HH:mm.",
            _ when tipo == typeof(int) => $"El valor de {campo} debe ser un número entero.",
            _ => $"El valor de {campo} no tiene el formato esperado.",
        };
    }

    // El campo puede ser un parámetro de la acción (?fecha=…) o una propiedad del cuerpo.
    private static Type? TipoDelCampo(ActionContext contexto, string campo)
    {
        var parametros = contexto.ActionDescriptor.Parameters;

        return parametros.FirstOrDefault(parametro => string.Equals(parametro.Name, campo, StringComparison.OrdinalIgnoreCase))?.ParameterType
            ?? parametros
                .SelectMany(parametro => parametro.ParameterType.GetProperties())
                .FirstOrDefault(propiedad => string.Equals(propiedad.Name, campo, StringComparison.OrdinalIgnoreCase))
                ?.PropertyType;
    }
}
