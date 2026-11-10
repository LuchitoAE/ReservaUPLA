using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearReservas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:btree_gist", ",,");

            migrationBuilder.CreateSequence<int>(
                name: "reservas_numero_seq");

            migrationBuilder.CreateTable(
                name: "reservas",
                columns: table => new
                {
                    id_reserva = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_reserva = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    fecha_reserva = table.Column<DateOnly>(type: "date", nullable: false),
                    hora_inicio_reserva = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    hora_fin_reserva = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    motivo_reserva = table.Column<string>(type: "text", nullable: false),
                    estado_reserva = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_ambiente = table.Column<Guid>(type: "uuid", nullable: false),
                    fecha_registro_reserva = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fecha_actualizacion_reserva = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reservas", x => x.id_reserva);
                    table.CheckConstraint("ck_reservas_hora_fin_mayor", "hora_fin_reserva > hora_inicio_reserva");
                    table.CheckConstraint("ck_reservas_horario_permitido", "hora_inicio_reserva >= TIME '07:00' AND hora_fin_reserva <= TIME '22:00'");
                    table.ForeignKey(
                        name: "fk_reservas_ambientes",
                        column: x => x.id_ambiente,
                        principalTable: "ambientes",
                        principalColumn: "id_ambiente",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_reservas_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_reservas_estado_reserva",
                table: "reservas",
                column: "estado_reserva");

            migrationBuilder.CreateIndex(
                name: "ix_reservas_id_ambiente_fecha_reserva",
                table: "reservas",
                columns: new[] { "id_ambiente", "fecha_reserva" });

            migrationBuilder.CreateIndex(
                name: "ix_reservas_id_usuario",
                table: "reservas",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_reservas_codigo_reserva",
                table: "reservas",
                column: "codigo_reserva",
                unique: true);

            // RN-01 en la base: dos reservas aprobadas del mismo ambiente no pueden tener horarios que se crucen.
            // El dominio ya lo revisa; esta restricción detiene el caso de dos aprobaciones al mismo tiempo.
            // tsrange(inicio, fin, '[)'): el fin no cuenta, así que 08:00-10:00 y 10:00-12:00 no chocan.
            migrationBuilder.Sql(
                """
                ALTER TABLE reservas ADD CONSTRAINT ex_reservas_aprobadas_sin_cruce
                EXCLUDE USING gist (
                    id_ambiente WITH =,
                    tsrange(fecha_reserva + hora_inicio_reserva, fecha_reserva + hora_fin_reserva, '[)') WITH &&
                ) WHERE (estado_reserva = 'Aprobada');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE reservas DROP CONSTRAINT IF EXISTS ex_reservas_aprobadas_sin_cruce;");

            migrationBuilder.DropTable(
                name: "reservas");

            migrationBuilder.DropSequence(
                name: "reservas_numero_seq");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:btree_gist", ",,");
        }
    }
}
