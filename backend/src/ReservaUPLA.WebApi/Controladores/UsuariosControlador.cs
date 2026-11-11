using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.CasosDeUso.Usuarios.RegistrarUsuario;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controladores;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch: de los errores se encarga
// ManejadorDeErrores. Solo el administrador registra usuarios de cualquier rol y ve la lista (tiene correos).
[ApiController]
[Controller]
[Route("api/usuarios")]
[Authorize(Roles = Sesion.Administrador)]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class UsuariosControlador : ControllerBase
{
    // RF-01: registrar un usuario.
    [HttpPost]
    [ProducesResponseType<RespuestaApi<DatosDeUsuario>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<DatosDeUsuario>>> Registrar(
        RegistrarUsuarioComando comando,
        [FromServices] RegistrarUsuarioCasoDeUso casoDeUso,
        CancellationToken cancelacion)
    {
        var usuario = await casoDeUso.EjecutarAsync(comando, cancelacion);

        return StatusCode(
            StatusCodes.Status201Created,
            RespuestaApi.Exito(usuario, $"Usuario {usuario.NombreCompletoUsuario} registrado correctamente."));
    }

    // Lista de usuarios, para la página de usuarios y para elegir al usuario actual o a un responsable.
    [HttpGet]
    [ProducesResponseType<RespuestaApi<IReadOnlyList<DatosDeUsuario>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<IReadOnlyList<DatosDeUsuario>>>> Listar(
        [FromServices] IConsultaDeUsuarios consulta,
        CancellationToken cancelacion,
        [FromQuery(Name = "rol_usuario")] RolUsuario? rolUsuario = null,
        [FromQuery(Name = "activo_usuario")] bool? activoUsuario = null)
    {
        var usuarios = await consulta.ListarAsync(rolUsuario, activoUsuario, cancelacion);

        return RespuestaApi.Exito(usuarios, $"{usuarios.Count} usuarios.");
    }
}
