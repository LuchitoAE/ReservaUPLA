using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
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

    public async Task<bool> ExisteCorreoAsync(string correo_usuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.Correo_Usuario == correo_usuario, cancelacion);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        _contexto.Usuarios.Add(usuario);

        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Usuario_Configuration.Indice_Correo))
        {
            // Dos registros con el mismo correo al mismo tiempo: el segundo lo detiene el índice único.
            throw new DatosNoValidosException(nameof(Usuario.Correo_Usuario), "Ya existe un usuario con este correo.");
        }
    }
}
