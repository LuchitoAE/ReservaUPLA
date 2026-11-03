using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.DTOs;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Persistence;

namespace ReservaUPLA.Infrastructure.Consultas;

// Lista de usuarios para la interfaz, con filtros opcionales por rol y por estado. Solo lectura (AsNoTracking).
internal sealed class ConsultaDeUsuarios : IConsultaDeUsuarios
{
    private readonly ReservaUPLADbContext _contexto;

    public ConsultaDeUsuarios(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<UsuarioDto>> ListarAsync(
        Roles_Usuario? rol_usuario, bool? activo_usuario, CancellationToken cancelacion = default)
    {
        var usuarios = _contexto.Usuarios.AsNoTracking();

        if (rol_usuario is not null)
        {
            usuarios = usuarios.Where(u => u.Rol_Usuario == rol_usuario);
        }

        if (activo_usuario is not null)
        {
            usuarios = usuarios.Where(u => u.Activo_Usuario == activo_usuario);
        }

        return await usuarios
            .OrderBy(u => u.Nombre_Completo_Usuario)
            .Select(u => new UsuarioDto(u.Id_Usuario, u.Nombre_Completo_Usuario, u.Correo_Usuario, u.Rol_Usuario, u.Activo_Usuario))
            .ToListAsync(cancelacion);
    }
}
