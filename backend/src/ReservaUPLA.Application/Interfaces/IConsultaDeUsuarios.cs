using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de usuarios: lee la base y entrega directamente los DTOs que muestra la interfaz.
// Va separada del repositorio: leer para mostrar y guardar entidades son responsabilidades distintas (SRP).
public interface IConsultaDeUsuarios
{
    Task<IReadOnlyList<UsuarioDto>> ListarAsync(
        Roles_Usuario? rol_usuario, bool? activo_usuario, CancellationToken cancelacion = default);
}
