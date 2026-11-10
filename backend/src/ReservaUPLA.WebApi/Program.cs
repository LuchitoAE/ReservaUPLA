using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.OpenApi;
using ReservaUPLA.Application;
using ReservaUPLA.Infrastructure;
using ReservaUPLA.WebApi.Arranque;
using ReservaUPLA.WebApi.Json;
using ReservaUPLA.WebApi.Middleware;
using ReservaUPLA.WebApi.Seguridad;
using ReservaUPLA.WebApi.Validacion;

var builder = WebApplication.CreateBuilder(args);

// La cadena de conexión no va en el repositorio: se lee de los user-secrets de .NET.
var cadena_conexion = builder.Configuration.GetConnectionString("ReservaUPLA")
    ?? throw new InvalidOperationException("Falta la cadena de conexión 'ReservaUPLA' en los user-secrets.");

// Punto de composición: aquí se eligen las implementaciones concretas de cada contrato.
builder.Services.AgregarAplicacion();
builder.Services.AgregarInfraestructura(cadena_conexion);

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

// Sesión con cookie: HttpOnly (el JavaScript no la lee), SameSite=Strict (no viaja desde otros sitios) y 8 horas que
// se renuevan con el uso. Sin sesión la API responde 401 y sin el rol 403, en el mismo formato que los demás errores,
// en lugar de redirigir a una página de inicio de sesión que la API no tiene.
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(opciones =>
    {
        opciones.Cookie.Name = "reservaupla_sesion";
        opciones.Cookie.HttpOnly = true;
        opciones.Cookie.SameSite = SameSiteMode.Strict;
        opciones.ExpireTimeSpan = TimeSpan.FromHours(8);
        opciones.SlidingExpiration = true;
        opciones.Events.OnRedirectToLogin = contexto => Sesion.EscribirProblema(contexto.HttpContext,
            StatusCodes.Status401Unauthorized, "Inicie sesión para continuar.",
            "Su sesión no existe o ya terminó. Ingrese con su código y su contraseña.");
        opciones.Events.OnRedirectToAccessDenied = contexto => Sesion.EscribirProblema(contexto.HttpContext,
            StatusCodes.Status403Forbidden, "Acción no permitida para este usuario.", "Su rol no permite esta acción.");
    });

// Todo endpoint exige sesión salvo los que digan [AllowAnonymous] (ingreso y salida).
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

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

// RF-15 y RNF-22: el primer administrador y, en desarrollo, las cuentas de prueba, con datos de los secretos de usuario.
await app.CrearCuentasInicialesAsync();

app.UseExceptionHandler();

// Swagger solo en desarrollo: sirve para probar los endpoints a mano, no se publica. Va antes de la autenticación:
// su página no es un endpoint, y la regla «todo exige sesión» la bloquearía con 401. Para probar los endpoints
// protegidos, primero se ejecuta POST /api/autenticacion/ingreso en el mismo Swagger: la cookie queda guardada.
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUI(opciones =>
    {
        opciones.SwaggerEndpoint("/openapi/v1.json", "ReservaUPLA v1");
        opciones.DocumentTitle = "ReservaUPLA — API";
    });
}

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
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
