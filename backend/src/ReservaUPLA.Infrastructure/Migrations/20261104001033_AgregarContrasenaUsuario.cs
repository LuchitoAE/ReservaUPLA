using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarContrasenaUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "hash_contrasena_usuario",
                table: "usuarios",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "sal_contrasena_usuario",
                table: "usuarios",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hash_contrasena_usuario",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "sal_contrasena_usuario",
                table: "usuarios");
        }
    }
}
