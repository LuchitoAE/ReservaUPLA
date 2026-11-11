using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.WebApi.Seguridad;

// La sesión viaja en una cookie cifrada por ASP.NET Core (HttpOnly: el JavaScript de la página no puede leerla).
// Guarda quién es el usuario y su rol; el dominio vuelve a leer el rol de la base antes de aprobar o rechazar.
public static class Sesion
{
    public const string Administrador = nameof(RolUsuario.Administrador);

    public static ClaimsPrincipal CrearPrincipal(DatosDeUsuario usuario) => new(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.NombreCompletoUsuario),
            new Claim(ClaimTypes.Role, usuario.RolUsuario.ToString()),
        ],
        CookieAuthenticationDefaults.AuthenticationScheme));

    public static Guid IdUsuario(this ClaimsPrincipal principal) =>
        Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

    // Sin sesión (401) o sin el rol (403): la misma forma de error que el resto de la API (RFC 9457).
    public static Task EscribirProblema(HttpContext contexto, int estado, string titulo, string detalle)
    {
        contexto.Response.StatusCode = estado;
        contexto.Request.Headers.Accept = "application/problem+json";
        var servicio = contexto.RequestServices.GetRequiredService<IProblemDetailsService>();

        return servicio.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = contexto,
            ProblemDetails = new ProblemDetails { Status = estado, Title = titulo, Detail = detalle },
        }).AsTask();
    }
}
