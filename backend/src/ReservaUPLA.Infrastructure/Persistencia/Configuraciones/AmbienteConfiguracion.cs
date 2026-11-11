using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo de la entidad Ambiente a la tabla ambientes (modelo del caso: Id, Nombre, Tipo, Capacidad, Ubicacion,
// Estado), más el responsable del ambiente.
internal sealed class AmbienteConfiguracion : IEntityTypeConfiguration<Ambiente>
{
    public const string IndiceNombre = "ux_ambientes_nombre_ambiente";

    public void Configure(EntityTypeBuilder<Ambiente> ambiente)
    {
        ambiente.ToTable("ambientes", tabla =>
            tabla.HasCheckConstraint("ck_ambientes_capacidad_ambiente",
                $"capacidad_ambiente BETWEEN {Ambiente.CapacidadMinima} AND {Ambiente.CapacidadMaxima}"));

        ambiente.HasKey(a => a.IdAmbiente).HasName("pk_ambientes");

        ambiente.Property(a => a.IdAmbiente).HasColumnName("id_ambiente");

        ambiente.Property(a => a.NombreAmbiente)
            .HasColumnName("nombre_ambiente")
            .HasMaxLength(Ambiente.LongitudMaximaNombre)
            .IsRequired();

        ambiente.HasIndex(a => a.NombreAmbiente).IsUnique().HasDatabaseName(IndiceNombre);

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        ambiente.Property(a => a.TipoAmbiente)
            .HasColumnName("tipo_ambiente")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        ambiente.Property(a => a.CapacidadAmbiente).HasColumnName("capacidad_ambiente").IsRequired();

        ambiente.Property(a => a.UbicacionAmbiente)
            .HasColumnName("ubicacion_ambiente")
            .HasMaxLength(Ambiente.LongitudMaximaUbicacion)
            .IsRequired();

        ambiente.Property(a => a.EstadoAmbiente)
            .HasColumnName("estado_ambiente")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        ambiente.Property(a => a.IdResponsableAmbiente).HasColumnName("id_responsable_ambiente");

        // El responsable es un usuario existente; no se puede borrar un usuario que tiene ambientes a su cargo.
        ambiente.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(a => a.IdResponsableAmbiente)
            .HasConstraintName("fk_ambientes_usuarios_responsable")
            .OnDelete(DeleteBehavior.Restrict);

        ambiente.HasIndex(a => a.IdResponsableAmbiente).HasDatabaseName("ix_ambientes_id_responsable_ambiente");
    }
}
