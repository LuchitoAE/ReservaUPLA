using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.WebApi.Respuestas;
using ReservaUPLA.WebApi.Seguridad;

namespace ReservaUPLA.WebApi.Controllers;

// Traduce HTTP a casos de uso y consultas. Sin reglas de negocio ni try/catch: de los errores se encarga
// ManejadorDeErrores. Solo el administrador registra usuarios de cualquier rol y ve la lista (tiene correos).
[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = Sesion.Administrador)]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden, "application/problem+json")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError, "application/problem+json")]
public sealed class UsuariosController : ControllerBase
{
    // RF-01: registrar un usuario.
    [HttpPost]
    [ProducesResponseType<RespuestaApi<UsuarioDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<UsuarioDto>>> Registrar(
        RegistrarUsuarioCommand comando,
        [FromServices] RegistrarUsuarioUseCase caso_de_uso,
        CancellationToken cancelacion)
    {
        var usuario = await caso_de_uso.EjecutarAsync(comando, cancelacion);

        return StatusCode(
            StatusCodes.Status201Created,
            RespuestaApi.Exito(usuario, $"Usuario {usuario.Nombre_Completo_Usuario} registrado correctamente."));
    }

    // Lista de usuarios, para la página de usuarios y para elegir al usuario actual o a un responsable.
    [HttpGet]
    [ProducesResponseType<RespuestaApi<IReadOnlyList<UsuarioDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    public async Task<ActionResult<RespuestaApi<IReadOnlyList<UsuarioDto>>>> Listar(
        [FromServices] IConsultaDeUsuarios consulta,
        CancellationToken cancelacion,
        [FromQuery] Roles_Usuario? rol_usuario = null,
        [FromQuery] bool? activo_usuario = null)
    {
        var usuarios = await consulta.ListarAsync(rol_usuario, activo_usuario, cancelacion);

        return RespuestaApi.Exito(usuarios, $"{usuarios.Count} usuarios.");
    }
}
