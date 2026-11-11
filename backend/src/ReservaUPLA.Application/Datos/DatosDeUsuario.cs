using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Datos;

// Datos de un usuario que salen hacia la API: los mismos de la entidad, sin su comportamiento ni su contraseña.
public sealed record DatosDeUsuario(
    Guid IdUsuario,
    string CodigoUsuario,
    string NombreCompletoUsuario,
    string CorreoUsuario,
    RolUsuario RolUsuario,
    bool ActivoUsuario)
{
    public static DatosDeUsuario DesdeEntidad(Usuario usuario) => new(
        usuario.IdUsuario,
        usuario.CodigoUsuario,
        usuario.NombreCompletoUsuario,
        usuario.CorreoUsuario,
        usuario.RolUsuario,
        usuario.ActivoUsuario);
}
