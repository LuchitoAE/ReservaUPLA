using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Persistence.Configurations;

// Mapeo de la entidad Usuario a la tabla usuarios (modelo de datos del caso: Id, NombreCompleto, Correo, Rol, Activo).
internal sealed class Usuario_Configuration : IEntityTypeConfiguration<Usuario>
{
    public const string Indice_Correo = "ux_usuarios_correo_usuario";

    public void Configure(EntityTypeBuilder<Usuario> usuario)
    {
        usuario.ToTable("usuarios");

        usuario.HasKey(u => u.Id_Usuario).HasName("pk_usuarios");

        usuario.Property(u => u.Id_Usuario).HasColumnName("id_usuario");

        usuario.Property(u => u.Nombre_Completo_Usuario)
            .HasColumnName("nombre_completo_usuario")
            .HasMaxLength(Usuario.Longitud_Maxima_Nombre)
            .IsRequired();

        usuario.Property(u => u.Correo_Usuario)
            .HasColumnName("correo_usuario")
            .HasMaxLength(Usuario.Longitud_Maxima_Correo)
            .IsRequired();

        // El correo identifica a la persona: la base tampoco admite dos iguales, aunque lleguen a la vez.
        usuario.HasIndex(u => u.Correo_Usuario).IsUnique().HasDatabaseName(Indice_Correo);

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        usuario.Property(u => u.Rol_Usuario)
            .HasColumnName("rol_usuario")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        usuario.Property(u => u.Activo_Usuario).HasColumnName("activo_usuario").IsRequired();
    }
}
