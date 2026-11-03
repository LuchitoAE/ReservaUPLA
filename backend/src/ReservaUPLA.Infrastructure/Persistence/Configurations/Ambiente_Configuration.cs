using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Persistence.Configurations;

// Mapeo de la entidad Ambiente a la tabla ambientes (modelo del caso: Id, Nombre, Tipo, Capacidad, Ubicacion,
// Estado), más el responsable del ambiente.
internal sealed class Ambiente_Configuration : IEntityTypeConfiguration<Ambiente>
{
    public const string Indice_Nombre = "ux_ambientes_nombre_ambiente";

    public void Configure(EntityTypeBuilder<Ambiente> ambiente)
    {
        ambiente.ToTable("ambientes", tabla =>
            tabla.HasCheckConstraint("ck_ambientes_capacidad_ambiente",
                $"capacidad_ambiente BETWEEN {Ambiente.Capacidad_Minima} AND {Ambiente.Capacidad_Maxima}"));

        ambiente.HasKey(a => a.Id_Ambiente).HasName("pk_ambientes");

        ambiente.Property(a => a.Id_Ambiente).HasColumnName("id_ambiente");

        ambiente.Property(a => a.Nombre_Ambiente)
            .HasColumnName("nombre_ambiente")
            .HasMaxLength(Ambiente.Longitud_Maxima_Nombre)
            .IsRequired();

        ambiente.HasIndex(a => a.Nombre_Ambiente).IsUnique().HasDatabaseName(Indice_Nombre);

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        ambiente.Property(a => a.Tipo_Ambiente)
            .HasColumnName("tipo_ambiente")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        ambiente.Property(a => a.Capacidad_Ambiente).HasColumnName("capacidad_ambiente").IsRequired();

        ambiente.Property(a => a.Ubicacion_Ambiente)
            .HasColumnName("ubicacion_ambiente")
            .HasMaxLength(Ambiente.Longitud_Maxima_Ubicacion)
            .IsRequired();

        ambiente.Property(a => a.Estado_Ambiente)
            .HasColumnName("estado_ambiente")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        ambiente.Property(a => a.Id_Responsable_Ambiente).HasColumnName("id_responsable_ambiente");

        // El responsable es un usuario existente; no se puede borrar un usuario que tiene ambientes a su cargo.
        ambiente.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(a => a.Id_Responsable_Ambiente)
            .HasConstraintName("fk_ambientes_usuarios_responsable")
            .OnDelete(DeleteBehavior.Restrict);

        ambiente.HasIndex(a => a.Id_Responsable_Ambiente).HasDatabaseName("ix_ambientes_id_responsable_ambiente");
    }
}
