using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Pruebas.Dobles;

// Repositorio de usuarios en memoria: permite probar los casos de uso sin base de datos.
internal sealed class RepositorioDeUsuariosEnMemoria : IUsuarioRepository
{
    public List<Usuario> Usuarios { get; } = [];

    public Task<Usuario?> ObtenerPorIdAsync(Guid id_usuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.FirstOrDefault(u => u.Id_Usuario == id_usuario));

    public Task<Usuario?> ObtenerPorCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.FirstOrDefault(u => u.Codigo_Usuario == codigo_usuario));

    public Task<bool> ExisteCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.Codigo_Usuario == codigo_usuario));

    public Task<bool> ExisteCorreoAsync(string correo_usuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.Correo_Usuario == correo_usuario));

    public Task<bool> ExisteAdministradorActivoAsync(CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.Activo_Usuario && u.Rol_Usuario == Roles_Usuario.Administrador));

    public Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        Usuarios.Add(usuario);
        return Task.CompletedTask;
    }
}
