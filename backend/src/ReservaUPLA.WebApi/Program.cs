using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.OpenApi;
using ReservaUPLA.Application;
using ReservaUPLA.Infrastructure;
using ReservaUPLA.WebApi.Json;
using ReservaUPLA.WebApi.Middleware;
using ReservaUPLA.WebApi.Validacion;

var builder = WebApplication.CreateBuilder(args);

// La cadena de conexión no va en el repositorio: se lee de los user-secrets de .NET.
var cadena_conexion = builder.Configuration.GetConnectionString("ReservaUPLA")
    ?? throw new InvalidOperationException("Falta la cadena de conexión 'ReservaUPLA' en los user-secrets.");

// Punto de composición: aquí se eligen las implementaciones concretas de cada contrato.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(cadena_conexion);

// La API responde solo JSON: sin el formateador de texto, Swagger no ofrece text/plain.
builder.Services.AddControllers(opciones => opciones.OutputFormatters.RemoveType<StringOutputFormatter>())
    .AddJsonOptions(opciones => ConfigurarJson(opciones.JsonSerializerOptions))
    .ConfigureApiBehaviorOptions(opciones =>
    {
        // JSON ilegible o valores de otro tipo: la respuesta en español, con el campo que falló.
        opciones.InvalidModelStateResponseFactory = RespuestaDeFormatoNoValido.Crear;
        opciones.ClientErrorMapping[StatusCodes.Status404NotFound].Title = "No se encontró lo que se buscaba.";
    });

// La misma configuración para el documento de OpenAPI, que se genera aparte: así Swagger muestra
// los nombres y los valores tal como los espera la API.
builder.Services.ConfigureHttpJsonOptions(opciones => ConfigurarJson(opciones.SerializerOptions));

// Todos los errores salen como ProblemDetails (RFC 9457). El estándar admite campos extra: se agregan
// success y message, los mismos que llevan las respuestas exitosas, para que el cliente lea siempre igual.
builder.Services.AddProblemDetails(opciones => opciones.CustomizeProblemDetails = contexto =>
{
    contexto.ProblemDetails.Extensions["success"] = false;
    contexto.ProblemDetails.Extensions["message"] = contexto.ProblemDetails.Detail ?? contexto.ProblemDetails.Title;
});
builder.Services.AddExceptionHandler<ManejadorDeErrores>();

// Genera la descripción de la API (/openapi/v1.json), que alimenta a Swagger.
builder.Services.AddOpenApi(opciones =>
{
    opciones.AddSchemaTransformer((esquema, contexto, _) =>
    {
        // Los campos opcionales (TimeOnly?, Estados_Reserva?) se describen igual que los obligatorios.
        var tipo = Nullable.GetUnderlyingType(contexto.JsonTypeInfo.Type) ?? contexto.JsonTypeInfo.Type;
        var admite_nulo = tipo != contexto.JsonTypeInfo.Type;

        // Los enums viajan como texto: sin esto Swagger los muestra como "any".
        if (tipo.IsEnum)
        {
            esquema.Type = admite_nulo ? JsonSchemaType.String | JsonSchemaType.Null : JsonSchemaType.String;
        }

        // Las horas viajan como «HH:mm» (Convertidor_Hora): el ejemplo de Swagger debe decir lo mismo.
        if (tipo == typeof(TimeOnly))
        {
            esquema.Type = admite_nulo ? JsonSchemaType.String | JsonSchemaType.Null : JsonSchemaType.String;
            esquema.Format = null;
            esquema.Pattern = "^([01][0-9]|2[0-3]):[0-5][0-9]$";
            esquema.Examples = [System.Text.Json.Nodes.JsonValue.Create("09:00")];
        }

        return Task.CompletedTask;
    });
});

var app = builder.Build();

app.UseExceptionHandler();

// Swagger solo en desarrollo: sirve para probar los endpoints a mano, no se publica.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(opciones =>
    {
        opciones.SwaggerEndpoint("/openapi/v1.json", "ReservaUPLA v1");
        opciones.DocumentTitle = "ReservaUPLA — API";
    });
}

app.MapControllers();

app.Run();

// Nombres en minúsculas con guion bajo, enums como texto y horas «HH:mm», en la API y en Swagger.
static void ConfigurarJson(System.Text.Json.JsonSerializerOptions opciones)
{
    opciones.PropertyNamingPolicy = new Politica_Nombres_Json();
    opciones.Converters.Add(new JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: false));
    opciones.Converters.Add(new Convertidor_Hora());
}
