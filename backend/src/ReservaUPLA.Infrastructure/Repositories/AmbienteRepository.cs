using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Infrastructure.Persistence;
using ReservaUPLA.Infrastructure.Persistence.Configurations;

namespace ReservaUPLA.Infrastructure.Repositories;

// Implementación con Entity Framework Core y PostgreSQL del contrato de ambientes.
internal sealed class AmbienteRepository : IRepositorioDeAmbientes
{
    private readonly ReservaUPLADbContext _contexto;

    public AmbienteRepository(ReservaUPLADbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<Ambiente?> ObtenerPorIdAsync(Guid id_ambiente, CancellationToken cancelacion = default)
    {
        return await _contexto.Ambientes.AsNoTracking().FirstOrDefaultAsync(a => a.Id_Ambiente == id_ambiente, cancelacion);
    }

    public async Task<bool> ExisteNombreAsync(string nombre_ambiente, CancellationToken cancelacion = default)
    {
        var nombre = nombre_ambiente.ToLower();

        return await _contexto.Ambientes.AnyAsync(a => a.Nombre_Ambiente.ToLower() == nombre, cancelacion);
    }

    public async Task AgregarAsync(Ambiente ambiente, CancellationToken cancelacion = default)
    {
        _contexto.Ambientes.Add(ambiente);

        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsValorRepetido(error, Ambiente_Configuration.Indice_Nombre))
        {
            throw new DatosNoValidosExcepcion(nameof(Ambiente.Nombre_Ambiente), "Ya existe un ambiente con este nombre.");
        }
    }
}
