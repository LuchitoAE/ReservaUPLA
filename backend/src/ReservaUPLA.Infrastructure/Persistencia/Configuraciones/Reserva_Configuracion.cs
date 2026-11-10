using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo de la entidad Reserva a la tabla reservas (modelo del caso: Id, Fecha, HoraInicio, HoraFin, Motivo, Estado,
// UsuarioId, AmbienteId), más el código legible y las fechas de registro y de último cambio.
// La base repite las reglas que no dependen de otras filas (RN-03 y RN-04) con restricciones CHECK; RN-01, que
// compara filas, la garantiza la restricción de exclusión de la migración CrearReservas.
internal sealed class Reserva_Configuracion : IEntityTypeConfiguration<Reserva>
{
    public const string Restriccion_Sin_Cruce = "ex_reservas_aprobadas_sin_cruce";

    public void Configure(EntityTypeBuilder<Reserva> reserva)
    {
        reserva.ToTable("reservas", tabla =>
        {
            tabla.HasCheckConstraint("ck_reservas_hora_fin_mayor", "hora_fin_reserva > hora_inicio_reserva");
            tabla.HasCheckConstraint("ck_reservas_horario_permitido",
                "hora_inicio_reserva >= TIME '07:00' AND hora_fin_reserva <= TIME '22:00'");
        });

        reserva.HasKey(r => r.Id_Reserva).HasName("pk_reservas");

        reserva.Property(r => r.Id_Reserva).HasColumnName("id_reserva");

        reserva.Property(r => r.Codigo_Reserva)
            .HasColumnName("codigo_reserva")
            .HasMaxLength(Reserva.Longitud_Maxima_Codigo)
            .IsRequired();

        reserva.HasIndex(r => r.Codigo_Reserva).IsUnique().HasDatabaseName("ux_reservas_codigo_reserva");

        reserva.Property(r => r.Fecha_Reserva).HasColumnName("fecha_reserva").IsRequired();
        reserva.Property(r => r.Hora_Inicio_Reserva).HasColumnName("hora_inicio_reserva").IsRequired();
        reserva.Property(r => r.Hora_Fin_Reserva).HasColumnName("hora_fin_reserva").IsRequired();

        reserva.Property(r => r.Motivo_Reserva)
            .HasColumnName("motivo_reserva")
            .HasColumnType("text")
            .IsRequired();

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        reserva.Property(r => r.Estado_Reserva)
            .HasColumnName("estado_reserva")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        reserva.Property(r => r.Id_Usuario).HasColumnName("id_usuario").IsRequired();
        reserva.Property(r => r.Id_Ambiente).HasColumnName("id_ambiente").IsRequired();
        reserva.Property(r => r.Fecha_Registro_Reserva).HasColumnName("fecha_registro_reserva").IsRequired();
        reserva.Property(r => r.Fecha_Actualizacion_Reserva).HasColumnName("fecha_actualizacion_reserva");

        // Toda reserva apunta a un solicitante y a un ambiente existentes; no se pueden borrar si tienen reservas.
        reserva.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(r => r.Id_Usuario)
            .HasConstraintName("fk_reservas_usuarios")
            .OnDelete(DeleteBehavior.Restrict);

        reserva.HasOne<Ambiente>()
            .WithMany()
            .HasForeignKey(r => r.Id_Ambiente)
            .HasConstraintName("fk_reservas_ambientes")
            .OnDelete(DeleteBehavior.Restrict);

        // La disponibilidad se consulta por ambiente y fecha; el listado y el dashboard filtran por estado.
        reserva.HasIndex(r => new { r.Id_Ambiente, r.Fecha_Reserva }).HasDatabaseName("ix_reservas_id_ambiente_fecha_reserva");
        reserva.HasIndex(r => r.Estado_Reserva).HasDatabaseName("ix_reservas_estado_reserva");
        reserva.HasIndex(r => r.Id_Usuario).HasDatabaseName("ix_reservas_id_usuario");
    }
}
