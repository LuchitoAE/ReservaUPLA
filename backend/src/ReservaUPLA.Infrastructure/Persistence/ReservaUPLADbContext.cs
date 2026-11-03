using Microsoft.EntityFrameworkCore;

namespace ReservaUPLA.Infrastructure.Persistence;

// Sesión de trabajo con PostgreSQL: expone las tablas y aplica el mapeo de cada entidad.
public sealed class ReservaUPLADbContext : DbContext
{
    public ReservaUPLADbContext(DbContextOptions<ReservaUPLADbContext> opciones) : base(opciones)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.ApplyConfigurationsFromAssembly(typeof(ReservaUPLADbContext).Assembly);
    }
}
