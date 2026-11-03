using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CrearAmbientes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ambientes",
                columns: table => new
                {
                    id_ambiente = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre_ambiente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tipo_ambiente = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    capacidad_ambiente = table.Column<int>(type: "integer", nullable: false),
                    ubicacion_ambiente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    estado_ambiente = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    id_responsable_ambiente = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ambientes", x => x.id_ambiente);
                    table.CheckConstraint("ck_ambientes_capacidad_ambiente", "capacidad_ambiente BETWEEN 1 AND 1000");
                    table.ForeignKey(
                        name: "fk_ambientes_usuarios_responsable",
                        column: x => x.id_responsable_ambiente,
                        principalTable: "usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ambientes_id_responsable_ambiente",
                table: "ambientes",
                column: "id_responsable_ambiente");

            migrationBuilder.CreateIndex(
                name: "ux_ambientes_nombre_ambiente",
                table: "ambientes",
                column: "nombre_ambiente",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ambientes");
        }
    }
}
