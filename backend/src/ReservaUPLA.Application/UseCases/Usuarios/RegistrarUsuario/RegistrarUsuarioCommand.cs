using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;

// Datos que llegan para registrar un usuario. Los textos admiten null a propósito: si faltan, el dominio
// responde con su mensaje en español en lugar del aviso genérico de ASP.NET.
public sealed record RegistrarUsuarioCommand(
    string? Nombre_Completo_Usuario,
    string? Correo_Usuario,
    Roles_Usuario Rol_Usuario);
