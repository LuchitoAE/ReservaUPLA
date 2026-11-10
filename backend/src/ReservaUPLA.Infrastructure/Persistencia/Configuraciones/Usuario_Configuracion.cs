using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo de la entidad Usuario a la tabla usuarios (modelo de datos del caso: Id, NombreCompleto, Correo, Rol, Activo),
// más el código con el que se ingresa (RN-14) y la sal y el hash de la contraseña.
internal sealed class Usuario_Configuracion : IEntityTypeConfiguration<Usuario>
{
    public const string Indice_Codigo = "ux_usuarios_codigo_usuario";
    public const string Indice_Correo = "ux_usuarios_correo_usuario";

    public void Configure(EntityTypeBuilder<Usuario> usuario)
    {
        usuario.ToTable("usuarios");

        usuario.HasKey(u => u.Id_Usuario).HasName("pk_usuarios");

        usuario.Property(u => u.Id_Usuario).HasColumnName("id_usuario");

        // El código identifica a la persona al ingresar: obligatorio, de 7 caracteres y sin repetirse.
        usuario.Property(u => u.Codigo_Usuario)
            .HasColumnName("codigo_usuario")
            .HasMaxLength(CodigoDeUsuario.Longitud)
            .IsRequired();
        usuario.HasIndex(u => u.Codigo_Usuario).IsUnique().HasDatabaseName(Indice_Codigo);

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

        // Solo la sal y el hash (PBKDF2): la contraseña nunca se guarda.
        usuario.Property(u => u.Sal_Contrasena_Usuario).HasColumnName("sal_contrasena_usuario").IsRequired();
        usuario.Property(u => u.Hash_Contrasena_Usuario).HasColumnName("hash_contrasena_usuario").IsRequired();
    }
}
