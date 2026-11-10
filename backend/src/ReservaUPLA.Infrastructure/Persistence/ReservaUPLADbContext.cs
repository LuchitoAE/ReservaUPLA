using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistence;

// Sesión de trabajo con PostgreSQL: expone las tablas y aplica el mapeo de cada entidad.
public sealed class ReservaUPLADbContext : DbContext
{
    // Secuencia de PostgreSQL que entrega el correlativo del código de la reserva (RES-2026-0001).
    internal const string Secuencia_Numero_Reserva = "reservas_numero_seq";

    public ReservaUPLADbContext(DbContextOptions<ReservaUPLADbContext> opciones) : base(opciones)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Ambiente> Ambientes => Set<Ambiente>();

    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        // btree_gist permite que una restricción de exclusión compare el ambiente (=) y el horario (&&) a la vez (RN-01).
        modelo.HasPostgresExtension("btree_gist");
        modelo.HasSequence<int>(Secuencia_Numero_Reserva).StartsAt(1).IncrementsBy(1);
        modelo.ApplyConfigurationsFromAssembly(typeof(ReservaUPLADbContext).Assembly);
    }
}
