using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.UseCases.Usuarios.RegistrarUsuario;

// Datos que llegan para registrar un usuario. Los textos admiten null a propósito: si faltan, el dominio
// responde con su mensaje en español en lugar del aviso genérico de ASP.NET. La contraseña solo pasa por aquí: se
// guarda cifrada y nunca vuelve en una respuesta.
public sealed record RegistrarUsuarioCommand(
    string? Nombre_Completo_Usuario,
    string? Correo_Usuario,
    Roles_Usuario Rol_Usuario,
    string? Contrasena_Usuario);
