using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReservaUPLA.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class AgregarCodigoUsuario : Migration
    {
        /// <inheritdoc />
        // RN-14: cada usuario ingresa con su código. Las filas que ya existen reciben un código provisional (U000001,
        // U000002…) para que la columna pueda ser obligatoria y única; el administrador puede corregirlo después.
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "codigo_usuario",
                table: "usuarios",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE usuarios AS u
                SET codigo_usuario = 'U' || lpad(n.numero::text, 6, '0')
                FROM (SELECT id_usuario, row_number() OVER (ORDER BY id_usuario) AS numero FROM usuarios) AS n
                WHERE u.id_usuario = n.id_usuario;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "codigo_usuario",
                table: "usuarios",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(7)",
                oldMaxLength: 7,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ux_usuarios_codigo_usuario",
                table: "usuarios",
                column: "codigo_usuario",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_usuarios_codigo_usuario",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "codigo_usuario",
                table: "usuarios");
        }
    }
}
