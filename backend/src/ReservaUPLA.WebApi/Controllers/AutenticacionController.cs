using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.UseCases.Autenticacion.CrearCuenta;
using ReservaUPLA.Application.UseCases.Autenticacion.IniciarSesion;
using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Exceptions;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controllers;

// Inicio y cierre de sesión, y la cuenta que un solicitante crea por sí mismo. Son los únicos endpoints que se usan
// sin sesión.
[ApiController]
[Route("api/autenticacion")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class AutenticacionController : ControllerBase
{
    [HttpPost("ingreso")]
    [AllowAnonymous]
    [ProducesResponseType<RespuestaApi<UsuarioDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<UsuarioDto>>> IniciarSesion(
        IniciarSesionCommand comando,
        [FromServices] IniciarSesionUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var usuario = await caso_de_uso.EjecutarAsync(comando, cancelacion);
        await HttpContext.SignInAsync(Sesion.CrearPrincipal(usuario));

        return RespuestaApi.Exito(usuario, $"Bienvenido, {usuario.Nombre_Completo_Usuario}.");
    }

    // RF-01: una persona crea su cuenta de solicitante y entra al sistema.
    [HttpPost("registro")]
    [AllowAnonymous]
    [ProducesResponseType<RespuestaApi<UsuarioDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<UsuarioDto>>> CrearCuenta(
        CrearCuentaCommand comando,
        [FromServices] RegistrarUsuarioUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var usuario = await caso_de_uso.EjecutarAsync(comando.ComoRegistro(), cancelacion);
        await HttpContext.SignInAsync(Sesion.CrearPrincipal(usuario));

        return StatusCode(StatusCodes.Status201Created,
            RespuestaApi.Exito(usuario, $"Cuenta creada. Bienvenido, {usuario.Nombre_Completo_Usuario}."));
    }

    // La SPA pregunta al abrirse si ya hay una sesión (por ejemplo, después de recargar la página).
    [HttpGet("sesion")]
    [ProducesResponseType<RespuestaApi<UsuarioDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<UsuarioDto>>> ObtenerSesion(
        [FromServices] IConsultaDeUsuarios consulta,
        CancellationToken cancelacion)
    {
        var usuario = await consulta.ObtenerActivoAsync(User.IdUsuario(), cancelacion);
        if (usuario is null)
        {
            await HttpContext.SignOutAsync();
            throw new SesionNoValidaException("Su sesión ya no es válida. Vuelva a ingresar.");
        }

        return RespuestaApi.Exito(usuario, $"Sesión de {usuario.Nombre_Completo_Usuario}.");
    }

    [HttpPost("salida")]
    [AllowAnonymous]
    [ProducesResponseType<RespuestaApi<string>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<RespuestaApi<string>>> CerrarSesion()
    {
        await HttpContext.SignOutAsync();

        return RespuestaApi.Exito("", "Sesión cerrada.");
    }
}
