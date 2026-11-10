using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.DTOs;

// Datos de un usuario que salen hacia la API: los mismos de la entidad, sin su comportamiento ni su contraseña.
public sealed record UsuarioDto(
    Guid Id_Usuario,
    string Codigo_Usuario,
    string Nombre_Completo_Usuario,
    string Correo_Usuario,
    Roles_Usuario Rol_Usuario,
    bool Activo_Usuario)
{
    public static UsuarioDto DesdeEntidad(Usuario usuario) => new(
        usuario.Id_Usuario,
        usuario.Codigo_Usuario,
        usuario.Nombre_Completo_Usuario,
        usuario.Correo_Usuario,
        usuario.Rol_Usuario,
        usuario.Activo_Usuario);
}
