using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearHistoriales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "historiales",
                columns: table => new
                {
                    id_historial = table.Column<Guid>(type: "uuid", nullable: false),
                    id_reserva = table.Column<Guid>(type: "uuid", nullable: false),
                    estado_historial = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    fecha_historial = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_historiales", x => x.id_historial);
                    table.ForeignKey(
                        name: "fk_historiales_reservas",
                        column: x => x.id_reserva,
                        principalTable: "reservas",
                        principalColumn: "id_reserva",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_historiales_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_historiales_id_reserva_fecha_historial",
                table: "historiales",
                columns: new[] { "id_reserva", "fecha_historial" });

            migrationBuilder.CreateIndex(
                name: "ix_historiales_id_usuario",
                table: "historiales",
                column: "id_usuario");

            // Las reservas que ya existían reciben su historial: la entrada de su registro (Pendiente, por quien la
            // solicitó) y, si ya cambiaron de estado, la de su estado actual con la fecha del último cambio. De ese
            // cambio no se sabe quién lo hizo: queda sin usuario, en lugar de inventarlo.
            migrationBuilder.Sql("""
                INSERT INTO historiales (id_historial, id_reserva, estado_historial, fecha_historial, id_usuario)
                SELECT gen_random_uuid(), id_reserva, 'Pendiente', fecha_registro_reserva, id_usuario
                FROM reservas;

                INSERT INTO historiales (id_historial, id_reserva, estado_historial, fecha_historial, id_usuario)
                SELECT gen_random_uuid(), id_reserva, estado_reserva,
                       COALESCE(fecha_actualizacion_reserva, fecha_registro_reserva), NULL
                FROM reservas
                WHERE estado_reserva <> 'Pendiente';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "historiales");
        }
    }
}
