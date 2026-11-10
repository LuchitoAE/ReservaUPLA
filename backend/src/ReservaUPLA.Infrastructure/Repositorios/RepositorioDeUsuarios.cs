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
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Usuario_Configuracion.Indice_Codigo))
        {
            // Dos registros con el mismo código al mismo tiempo: el segundo lo detiene el índice único.
            throw new DatosNoValidosExcepcion(nameof(Usuario.Codigo_Usuario), "Este código ya existe.");
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Usuario_Configuracion.Indice_Correo))
        {
            // Lo mismo con el correo.
            throw new DatosNoValidosExcepcion(nameof(Usuario.Correo_Usuario), "Ya existe un usuario con este correo.");
        }
    }
}
