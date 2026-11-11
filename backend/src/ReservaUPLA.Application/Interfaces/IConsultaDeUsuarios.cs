using ReservaUPLA.Application.Datos;
using ReservaUPLA.Domain.Enumeraciones;

namespace ReservaUPLA.Application.Interfaces;

// Módulo de salida de usuarios: lee la base y entrega directamente los datos que muestra la interfaz.
// Va separada del repositorio: leer para mostrar y guardar entidades son responsabilidades distintas (SRP).
public interface IConsultaDeUsuarios
{
    // El usuario de la sesión, si sigue existiendo y está activo.
    Task<DatosDeUsuario?> ObtenerActivoAsync(Guid idUsuario, CancellationToken cancelacion = default);

    Task<IReadOnlyList<DatosDeUsuario>> ListarAsync(
        RolUsuario? rolUsuario, bool? activoUsuario, CancellationToken cancelacion = default);
}
