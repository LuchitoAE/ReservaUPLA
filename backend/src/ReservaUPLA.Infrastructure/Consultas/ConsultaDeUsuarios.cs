using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Datos;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Infrastructure.Persistencia;

namespace ReservaUPLA.Infrastructure.Consultas;

// Lista de usuarios para la interfaz, con filtros opcionales por rol y por estado. Solo lectura (AsNoTracking).
internal sealed class ConsultaDeUsuarios : IConsultaDeUsuarios
{
    private readonly ContextoDeReservaUPLA _contexto;

    public ConsultaDeUsuarios(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<DatosDeUsuario?> ObtenerActivoAsync(
        Guid idUsuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios
            .AsNoTracking()
            .Where(u => u.IdUsuario == idUsuario && u.ActivoUsuario)
            .Select(u => new DatosDeUsuario(
                u.IdUsuario, u.CodigoUsuario, u.NombreCompletoUsuario, u.CorreoUsuario, u.RolUsuario, u.ActivoUsuario))
            .FirstOrDefaultAsync(cancelacion);
    }

    public async Task<IReadOnlyList<DatosDeUsuario>> ListarAsync(
        RolUsuario? rolUsuario, bool? activoUsuario, CancellationToken cancelacion = default)
    {
        var usuarios = _contexto.Usuarios.AsNoTracking();

        if (rolUsuario is not null)
        {
            usuarios = usuarios.Where(u => u.RolUsuario == rolUsuario);
        }

        if (activoUsuario is not null)
        {
            usuarios = usuarios.Where(u => u.ActivoUsuario == activoUsuario);
        }

        return await usuarios
            .OrderBy(u => u.NombreCompletoUsuario)
            .Select(u => new DatosDeUsuario(
                u.IdUsuario, u.CodigoUsuario, u.NombreCompletoUsuario, u.CorreoUsuario, u.RolUsuario, u.ActivoUsuario))
            .ToListAsync(cancelacion);
    }
}
