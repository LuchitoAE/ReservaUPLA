using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Persistence;

// Sesión de trabajo con PostgreSQL: expone las tablas y aplica el mapeo de cada entidad.
public sealed class ReservaUPLADbContext : DbContext
{
    public ReservaUPLADbContext(DbContextOptions<ReservaUPLADbContext> opciones) : base(opciones)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Ambiente> Ambientes => Set<Ambiente>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.ApplyConfigurationsFromAssembly(typeof(ReservaUPLADbContext).Assembly);
    }
}
