using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.CasosDeUso.Cuenta.CambiarContrasena;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controladores;

// Mi cuenta: lo que cada usuario hace con su propia cuenta. Siempre actúa sobre el usuario de la sesión, nunca sobre
// otro: no recibe ningún identificador. Sin reglas de negocio ni try/catch (los errores los traduce ManejadorDeErrores).
[ApiController]
[Controller]
[Route("api/cuenta")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class CuentaControlador : ControllerBase
{
    // RF-11: cambiar la contraseña, escribiendo la actual. 400 si la actual no coincide o la nueva no cumple RN-13.
    [HttpPut("contrasena")]
    [ProducesResponseType<RespuestaApi<string>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<string>>> CambiarContrasena(
        CambiarContrasenaComando comando,
        [FromServices] CambiarContrasenaCasoDeUso casoDeUso,
        CancellationToken cancelacion)
    {
        await casoDeUso.EjecutarAsync(comando, User.IdUsuario(), cancelacion);

        return RespuestaApi.Exito("", "Contraseña cambiada. La próxima vez ingrese con la nueva.");
    }
}
