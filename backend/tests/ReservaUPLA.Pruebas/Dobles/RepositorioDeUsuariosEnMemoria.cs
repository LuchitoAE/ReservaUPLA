using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Pruebas.Dobles;

// Repositorio de usuarios en memoria: permite probar los casos de uso sin base de datos.
internal sealed class RepositorioDeUsuariosEnMemoria : IRepositorioDeUsuarios
{
    public List<Usuario> Usuarios { get; } = [];

    // Cuántas veces se guardó un cambio: un intento rechazado no debe guardar nada.
    public int Actualizaciones { get; private set; }

    public Task<Usuario?> ObtenerPorIdAsync(Guid idUsuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.FirstOrDefault(u => u.IdUsuario == idUsuario));

    public Task<Usuario?> ObtenerPorCodigoAsync(string codigoUsuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.FirstOrDefault(u => u.CodigoUsuario == codigoUsuario));

    public Task<bool> ExisteCodigoAsync(string codigoUsuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.CodigoUsuario == codigoUsuario));

    public Task<bool> ExisteCorreoAsync(string correoUsuario, CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.CorreoUsuario == correoUsuario));

    public Task<bool> ExisteAdministradorActivoAsync(CancellationToken cancelacion = default) =>
        Task.FromResult(Usuarios.Any(u => u.ActivoUsuario && u.RolUsuario == RolUsuario.Administrador));

    public Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        Usuarios.Add(usuario);
        return Task.CompletedTask;
    }

    // En memoria el usuario ya es el mismo objeto: solo se cuenta la actualización.
    public Task ActualizarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        Actualizaciones++;
        return Task.CompletedTask;
    }
}
