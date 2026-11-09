using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Domain.Exceptions;
using ReservaUPLA.Infrastructure.Persistence;
using ReservaUPLA.Infrastructure.Persistence.Configurations;

namespace ReservaUPLA.Infrastructure.Repositories;

// Implementación con Entity Framework Core y PostgreSQL del contrato de usuarios.
internal sealed class UsuarioRepository : IUsuarioRepository
{
    private readonly ReservaUPLADbContext _contexto;

    public UsuarioRepository(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id_usuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id_Usuario == id_usuario, cancelacion);
    }

    public async Task<Usuario?> ObtenerPorCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Codigo_Usuario == codigo_usuario, cancelacion);
    }

    public async Task<bool> ExisteCodigoAsync(string codigo_usuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.Codigo_Usuario == codigo_usuario, cancelacion);
    }

    public async Task<bool> ExisteCorreoAsync(string correo_usuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.Correo_Usuario == correo_usuario, cancelacion);
    }

    public async Task<bool> ExisteAdministradorActivoAsync(CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.Activo_Usuario && u.Rol_Usuario == Roles_Usuario.Administrador, cancelacion);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        _contexto.Usuarios.Add(usuario);

        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Usuario_Configuration.Indice_Codigo))
        {
            // Dos registros con el mismo código al mismo tiempo: el segundo lo detiene el índice único.
            throw new DatosNoValidosException(nameof(Usuario.Codigo_Usuario), "Este código ya existe.");
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Usuario_Configuration.Indice_Correo))
        {
            // Lo mismo con el correo.
            throw new DatosNoValidosException(nameof(Usuario.Correo_Usuario), "Ya existe un usuario con este correo.");
        }
    }
}
