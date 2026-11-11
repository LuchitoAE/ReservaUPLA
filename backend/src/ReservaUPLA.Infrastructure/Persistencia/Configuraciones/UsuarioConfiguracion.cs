using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Comun;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo de la entidad Usuario a la tabla usuarios (modelo de datos del caso: Id, NombreCompleto, Correo, Rol, Activo),
// más el código con el que se ingresa (RN-14) y la sal y el hash de la contraseña.
internal sealed class UsuarioConfiguracion : IEntityTypeConfiguration<Usuario>
{
    public const string IndiceCodigo = "ux_usuarios_codigo_usuario";
    public const string IndiceCorreo = "ux_usuarios_correo_usuario";

    public void Configure(EntityTypeBuilder<Usuario> usuario)
    {
        usuario.ToTable("usuarios");

        usuario.HasKey(u => u.IdUsuario).HasName("pk_usuarios");

        usuario.Property(u => u.IdUsuario).HasColumnName("id_usuario");

        // El código identifica a la persona al ingresar: obligatorio, de 7 caracteres y sin repetirse.
        usuario.Property(u => u.CodigoUsuario)
            .HasColumnName("codigo_usuario")
            .HasMaxLength(CodigoDeUsuario.Longitud)
            .IsRequired();
        usuario.HasIndex(u => u.CodigoUsuario).IsUnique().HasDatabaseName(IndiceCodigo);

        usuario.Property(u => u.NombreCompletoUsuario)
            .HasColumnName("nombre_completo_usuario")
            .HasMaxLength(Usuario.LongitudMaximaNombre)
            .IsRequired();

        usuario.Property(u => u.CorreoUsuario)
            .HasColumnName("correo_usuario")
            .HasMaxLength(Usuario.LongitudMaximaCorreo)
            .IsRequired();

        // El correo identifica a la persona: la base tampoco admite dos iguales, aunque lleguen a la vez.
        usuario.HasIndex(u => u.CorreoUsuario).IsUnique().HasDatabaseName(IndiceCorreo);

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        usuario.Property(u => u.RolUsuario)
            .HasColumnName("rol_usuario")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        usuario.Property(u => u.ActivoUsuario).HasColumnName("activo_usuario").IsRequired();

        // Solo la sal y el hash (PBKDF2): la contraseña nunca se guarda.
        usuario.Property(u => u.SalContrasenaUsuario).HasColumnName("sal_contrasena_usuario").IsRequired();
        usuario.Property(u => u.HashContrasenaUsuario).HasColumnName("hash_contrasena_usuario").IsRequired();
    }
}
