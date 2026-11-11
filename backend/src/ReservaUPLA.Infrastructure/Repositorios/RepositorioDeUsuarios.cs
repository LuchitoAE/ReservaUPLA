using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Enumeraciones;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Infrastructure.Persistencia;
using ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

namespace ReservaUPLA.Infrastructure.Repositorios;

// Implementación con Entity Framework Core y PostgreSQL del contrato de usuarios.
internal sealed class RepositorioDeUsuarios : IRepositorioDeUsuarios
{
    private readonly ContextoDeReservaUPLA _contexto;

    public RepositorioDeUsuarios(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid idUsuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario, cancelacion);
    }

    public async Task<Usuario?> ObtenerPorCodigoAsync(string codigoUsuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.CodigoUsuario == codigoUsuario, cancelacion);
    }

    public async Task<bool> ExisteCodigoAsync(string codigoUsuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.CodigoUsuario == codigoUsuario, cancelacion);
    }

    public async Task<bool> ExisteCorreoAsync(string correoUsuario, CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(u => u.CorreoUsuario == correoUsuario, cancelacion);
    }

    public async Task<bool> ExisteAdministradorActivoAsync(CancellationToken cancelacion = default)
    {
        return await _contexto.Usuarios.AnyAsync(
            u => u.ActivoUsuario && u.RolUsuario == RolUsuario.Administrador, cancelacion);
    }

    // El usuario llega sin seguimiento (ObtenerPorIdAsync lee con AsNoTracking): Update lo marca como cambiado.
    public async Task ActualizarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        _contexto.Usuarios.Update(usuario);
        await _contexto.SaveChangesAsync(cancelacion);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancelacion = default)
    {
        _contexto.Usuarios.Add(usuario);

        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, UsuarioConfiguracion.IndiceCodigo))
        {
            // Dos registros con el mismo código al mismo tiempo: el segundo lo detiene el índice único.
            throw new DatosNoValidosExcepcion(nameof(Usuario.CodigoUsuario), "Este código ya existe.");
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, UsuarioConfiguracion.IndiceCorreo))
        {
            // Lo mismo con el correo.
            throw new DatosNoValidosExcepcion(nameof(Usuario.CorreoUsuario), "Ya existe un usuario con este correo.");
        }
    }
}
