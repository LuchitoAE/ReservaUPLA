using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entidades;
using ReservaUPLA.Domain.Excepciones;
using ReservaUPLA.Infrastructure.Persistencia;
using ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

namespace ReservaUPLA.Infrastructure.Repositorios;

// Implementación con Entity Framework Core y PostgreSQL del contrato de reservas.
internal sealed class RepositorioDeReservas : IRepositorioDeReservas
{
    private readonly ContextoDeReservaUPLA _contexto;

    public RepositorioDeReservas(ContextoDeReservaUPLA contexto)
    {
        _contexto = contexto;
    }

    public async Task<Reserva?> ObtenerPorIdAsync(Guid id_reserva, CancellationToken cancelacion = default)
    {
        return await _contexto.Reservas.FirstOrDefaultAsync(r => r.Id_Reserva == id_reserva, cancelacion);
    }

    public async Task<IReadOnlyList<Reserva>> ListarDelAmbienteEnLaFechaAsync(
        Guid id_ambiente, DateOnly fecha_reserva, CancellationToken cancelacion = default)
    {
        return await _contexto.Reservas
            .AsNoTracking()
            .Where(r => r.Id_Ambiente == id_ambiente && r.Fecha_Reserva == fecha_reserva)
            .ToListAsync(cancelacion);
    }

    // Pide el número a una secuencia de PostgreSQL: entrega un valor distinto a cada llamada, aunque dos personas
    // registren a la vez.
    public async Task<int> ObtenerSiguienteNumeroAsync(CancellationToken cancelacion = default)
    {
        var numeros = await _contexto.Database
            .SqlQueryRaw<long>($"SELECT nextval('{ContextoDeReservaUPLA.Secuencia_Numero_Reserva}') AS \"Value\"")
            .ToListAsync(cancelacion);

        return (int)numeros[0];
    }

    public async Task AgregarAsync(Reserva reserva, CancellationToken cancelacion = default)
    {
        _contexto.Reservas.Add(reserva);

        await GuardarCambiosAsync(cancelacion);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancelacion = default)
    {
        try
        {
            await _contexto.SaveChangesAsync(cancelacion);
        }
        catch (DbUpdateException error) when (ErroresDePostgres.EsExclusionViolada(error, Reserva_Configuracion.Restriccion_Sin_Cruce))
        {
            // Dos aprobaciones del mismo horario al mismo tiempo: la base detiene la segunda (RN-01).
            throw new ConflictoDeNegocioExcepcion(
                "El ambiente ya tiene una reserva aprobada que se cruza con este horario. Elija otro horario u otro ambiente.");
        }
    }
}
