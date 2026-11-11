using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ReservaUPLA.Infrastructure.Persistencia;

// Reconoce las restricciones de la base que también son reglas de negocio, para responder con su mensaje
// en lugar de un error 500. Los códigos son los de PostgreSQL (SQLSTATE).
internal static class ErroresDePostgres
{
    private const string ValorRepetido = "23505";
    private const string ExclusionViolada = "23P01";

    public static bool EsValorRepetido(DbUpdateException error, string restriccion) =>
        Es(error, ValorRepetido, restriccion);

    public static bool EsExclusionViolada(DbUpdateException error, string restriccion) =>
        Es(error, ExclusionViolada, restriccion);

    private static bool Es(DbUpdateException error, string codigo, string restriccion) =>
        error.InnerException is PostgresException postgres
        && postgres.SqlState == codigo
        && postgres.ConstraintName == restriccion;
}
