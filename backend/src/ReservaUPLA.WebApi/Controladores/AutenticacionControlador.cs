using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.CasosDeUso.Autenticacion.IniciarSesion;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controladores;

// Inicio y cierre de sesión (RF-09, RF-10). Son los únicos endpoints que se usan sin sesión. No hay registro propio:
// las cuentas las crea el administrador con el código que entrega la universidad (RN-07).
[ApiController]
[Controller]
[Route("api/autenticacion")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class AutenticacionControlador : ControllerBase
{
    [HttpPost("ingreso")]
    [AllowAnonymous]
    [ProducesResponseType<RespuestaApi<DatosDeUsuario>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DatosDeUsuario>>> IniciarSesion(
        IniciarSesionComando comando,
        [FromServices] IniciarSesionCasoDeUso caso_de_uso,
        CancellationToken cancelacion)
    {
        var usuario = await caso_de_uso.EjecutarAsync(comando, cancelacion);
        await HttpContext.SignInAsync(Sesion.CrearPrincipal(usuario));

        return RespuestaApi.Exito(usuario, $"Bienvenido, {usuario.Nombre_Completo_Usuario}.");
    }

    // La SPA pregunta al abrirse si ya hay una sesión (por ejemplo, después de recargar la página).
    [HttpGet("sesion")]
    [ProducesResponseType<RespuestaApi<DatosDeUsuario>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DatosDeUsuario>>> ObtenerSesion(
        [FromServices] IConsultaDeUsuarios consulta,
        CancellationToken cancelacion)
    {
        var usuario = await consulta.ObtenerActivoAsync(User.IdUsuario(), cancelacion);
        if (usuario is null)
        {
            await HttpContext.SignOutAsync();
            throw new SesionNoValidaExcepcion("Su sesión ya no es válida. Vuelva a ingresar.");
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
