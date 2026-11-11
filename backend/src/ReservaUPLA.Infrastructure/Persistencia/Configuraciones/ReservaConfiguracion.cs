using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entidades;

namespace ReservaUPLA.Infrastructure.Persistencia.Configuraciones;

// Mapeo de la entidad Reserva a la tabla reservas (modelo del caso: Id, Fecha, HoraInicio, HoraFin, Motivo, Estado,
// UsuarioId, AmbienteId), más el código legible y las fechas de registro y de último cambio.
// La base repite las reglas que no dependen de otras filas (RN-03 y RN-04) con restricciones CHECK; RN-01, que
// compara filas, la garantiza la restricción de exclusión de la migración CrearReservas.
internal sealed class ReservaConfiguracion : IEntityTypeConfiguration<Reserva>
{
    public const string RestriccionSinCruce = "ex_reservas_aprobadas_sin_cruce";

    public void Configure(EntityTypeBuilder<Reserva> reserva)
    {
        reserva.ToTable("reservas", tabla =>
        {
            tabla.HasCheckConstraint("ck_reservas_hora_fin_mayor", "hora_fin_reserva > hora_inicio_reserva");
            tabla.HasCheckConstraint("ck_reservas_horario_permitido",
                "hora_inicio_reserva >= TIME '07:00' AND hora_fin_reserva <= TIME '22:00'");
        });

        reserva.HasKey(r => r.IdReserva).HasName("pk_reservas");

        reserva.Property(r => r.IdReserva).HasColumnName("id_reserva");

        reserva.Property(r => r.CodigoReserva)
            .HasColumnName("codigo_reserva")
            .HasMaxLength(Reserva.LongitudMaximaCodigo)
            .IsRequired();

        reserva.HasIndex(r => r.CodigoReserva).IsUnique().HasDatabaseName("ux_reservas_codigo_reserva");

        reserva.Property(r => r.FechaReserva).HasColumnName("fecha_reserva").IsRequired();
        reserva.Property(r => r.HoraInicioReserva).HasColumnName("hora_inicio_reserva").IsRequired();
        reserva.Property(r => r.HoraFinReserva).HasColumnName("hora_fin_reserva").IsRequired();

        reserva.Property(r => r.MotivoReserva)
            .HasColumnName("motivo_reserva")
            .HasColumnType("text")
            .IsRequired();

        // Los enums se guardan como texto: la fila se entiende al leerla, sin traducir números.
        reserva.Property(r => r.EstadoReserva)
            .HasColumnName("estado_reserva")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        reserva.Property(r => r.IdUsuario).HasColumnName("id_usuario").IsRequired();
        reserva.Property(r => r.IdAmbiente).HasColumnName("id_ambiente").IsRequired();
        reserva.Property(r => r.FechaRegistroReserva).HasColumnName("fecha_registro_reserva").IsRequired();
        reserva.Property(r => r.FechaActualizacionReserva).HasColumnName("fecha_actualizacion_reserva");

        // Toda reserva apunta a un solicitante y a un ambiente existentes; no se pueden borrar si tienen reservas.
        reserva.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(r => r.IdUsuario)
            .HasConstraintName("fk_reservas_usuarios")
            .OnDelete(DeleteBehavior.Restrict);

        reserva.HasOne<Ambiente>()
            .WithMany()
            .HasForeignKey(r => r.IdAmbiente)
            .HasConstraintName("fk_reservas_ambientes")
            .OnDelete(DeleteBehavior.Restrict);

        // RF-06: la reserva es dueña de su historial (campo _historial). Al cambiar de estado, la entrada nueva se
        // inserta con la reserva aunque el historial no se haya leído.
        reserva.HasMany(r => r.HistorialReserva)
            .WithOne()
            .HasForeignKey(h => h.IdReserva)
            .HasConstraintName("fk_historiales_reservas")
            .OnDelete(DeleteBehavior.Cascade);
        reserva.Navigation(r => r.HistorialReserva).HasField("_historial");

        // La disponibilidad se consulta por ambiente y fecha; el listado y el dashboard filtran por estado.
        reserva.HasIndex(r => new { r.IdAmbiente, r.FechaReserva })
            .HasDatabaseName("ix_reservas_id_ambiente_fecha_reserva");
        reserva.HasIndex(r => r.EstadoReserva).HasDatabaseName("ix_reservas_estado_reserva");
        reserva.HasIndex(r => r.IdUsuario).HasDatabaseName("ix_reservas_id_usuario");
    }
}
