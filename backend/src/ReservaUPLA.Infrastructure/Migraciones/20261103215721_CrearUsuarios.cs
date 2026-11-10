using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre_completo_usuario = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    correo_usuario = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    rol_usuario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    activo_usuario = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuarios", x => x.id_usuario);
                });

            migrationBuilder.CreateIndex(
                name: "ux_usuarios_correo_usuario",
                table: "usuarios",
                column: "correo_usuario",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
