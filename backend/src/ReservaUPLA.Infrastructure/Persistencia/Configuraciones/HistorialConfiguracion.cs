using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo del historial de estados de cada reserva (RF-06) a la tabla historiales. La relación con la reserva se
// declara en ReservaConfiguracion, que es la dueña de su historial.
internal sealed class HistorialConfiguracion : IEntityTypeConfiguration<Historial>
{
    public void Configure(EntityTypeBuilder<Historial> historial)
    {
        historial.ToTable("historiales");

        historial.HasKey(h => h.IdHistorial).HasName("pk_historiales");

        // El identificador lo pone el dominio (Guid v7): así EF sabe que una entrada nueva se inserta.
        historial.Property(h => h.IdHistorial).HasColumnName("id_historial").ValueGeneratedNever();
        historial.Property(h => h.IdReserva).HasColumnName("id_reserva").IsRequired();

        historial.Property(h => h.EstadoHistorial)
            .HasColumnName("estado_historial")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        historial.Property(h => h.FechaHistorial).HasColumnName("fecha_historial").IsRequired();

        // Nulo solo en las entradas cargadas por la migración para cambios anteriores al historial.
        historial.Property(h => h.IdUsuario).HasColumnName("id_usuario");

        historial.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(h => h.IdUsuario)
            .HasConstraintName("fk_historiales_usuarios")
            .OnDelete(DeleteBehavior.Restrict);

        // El detalle de una reserva lee su historial completo, ordenado por fecha.
        historial.HasIndex(h => new { h.IdReserva, h.FechaHistorial })
            .HasDatabaseName("ix_historiales_id_reserva_fecha_historial");
        historial.HasIndex(h => h.IdUsuario).HasDatabaseName("ix_historiales_id_usuario");
    }
}
