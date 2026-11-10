using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de usuarios: lee la base y entrega directamente los DTOs que muestra la interfaz.
// Va separada del repositorio: leer para mostrar y guardar entidades son responsabilidades distintas (SRP).
public interface IConsultaDeUsuarios
{
    // El usuario de la sesión, si sigue existiendo y está activo.
    Task<UsuarioDto?> ObtenerActivoAsync(Guid id_usuario, CancellationToken cancelacion = default);

    Task<IReadOnlyList<UsuarioDto>> ListarAsync(
        Roles_Usuario? rol_usuario, bool? activo_usuario, CancellationToken cancelacion = default);
}
