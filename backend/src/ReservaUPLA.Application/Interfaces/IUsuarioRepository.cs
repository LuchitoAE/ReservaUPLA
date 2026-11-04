using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Application.Interfaces;

// Lo que los casos de uso necesitan para guardar y leer usuarios. Lo implementa la Infraestructura.
public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorIdAsync(Guid id_usuario, CancellationToken cancelacion = default);

    Task<Usuario?> ObtenerPorCorreoAsync(string correo_usuario, CancellationToken cancelacion = default);

    Task<bool> ExisteCorreoAsync(string correo_usuario, CancellationToken cancelacion = default);

    Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default);
}
