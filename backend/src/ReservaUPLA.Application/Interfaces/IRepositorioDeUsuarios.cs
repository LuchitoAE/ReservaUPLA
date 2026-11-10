using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Application.Interfaces;

// Lo que los casos de uso necesitan para guardar y leer usuarios. Lo implementa la Infraestructura.
public interface IRepositorioDeUsuarios
{
    Task<Usuario?> ObtenerPorIdAsync(Guid id_usuario, CancellationToken cancelacion = default);

    // Para ingresar (RF-09): el código ya normalizado.
    Task<Usuario?> ObtenerPorCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default);

    Task<bool> ExisteCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default);

    Task<bool> ExisteCorreoAsync(string correo_usuario, CancellationToken cancelacion = default);

    // Para crear el primer administrador solo si todavía no hay ninguno (RF-15).
    Task<bool> ExisteAdministradorActivoAsync(CancellationToken cancelacion = default);

    Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default);

    // Guarda los cambios de un usuario que ya existe (su contraseña, RF-11).
    Task ActualizarAsync(Usuario usuario, CancellationToken cancelacion = default);
}
