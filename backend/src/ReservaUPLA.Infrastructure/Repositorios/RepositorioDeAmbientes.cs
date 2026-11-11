using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Infrastructure.Persistencia;
using ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

namespace ReservaUPLA.Infrastructure.Repositorios;

// Implementación con Entity Framework Core y PostgreSQL del contrato de ambientes.
internal sealed class RepositorioDeAmbientes : IRepositorioDeAmbientes
{
    private readonly ContextoDeReservaUPLA _contexto;

    public RepositorioDeAmbientes(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<Ambiente?> ObtenerPorIdAsync(Guid idAmbiente, CancellationToken cancelacion = default)
    {
        return await _contexto.Ambientes.AsNoTracking()
            .FirstOrDefaultAsync(a => a.IdAmbiente == idAmbiente, cancelacion);
    }

    public async Task<bool> ExisteNombreAsync(string nombreAmbiente, CancellationToken cancelacion = default)
    {
        var nombre = nombreAmbiente.ToLower();

        return await _contexto.Ambientes.AnyAsync(a => a.NombreAmbiente.ToLower() == nombre, cancelacion);
    }

    public async Task AgregarAsync(Ambiente ambiente, CancellationToken cancelacion = default)
    {
        _contexto.Ambientes.Add(ambiente);

        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, AmbienteConfiguracion.IndiceNombre))
        {
            throw new DatosNoValidosExcepcion(nameof(Ambiente.NombreAmbiente), "Ya existe un ambiente con este nombre.");
        }
    }
}
