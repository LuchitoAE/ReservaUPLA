using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ReservaUPLA.Infrastructure.Persistence;

// Reconoce las restricciones de la base que también son reglas de negocio, para responder con su mensaje
// en lugar de un error 500. Los códigos son los de PostgreSQL (SQLSTATE).
internal static class ErroresDePostgres
{
    private const string Valor_Repetido = "23505";
    private const string Exclusion_Violada = "23P01";

    public static bool EsValorRepetido(DbUpdateException error, string restriccion) =>
        Es(error, Valor_Repetido, restriccion);

    public static bool EsExclusionViolada(DbUpdateException error, string restriccion) =>
        Es(error, Exclusion_Violada, restriccion);

    private static bool Es(DbUpdateException error, string codigo, string restriccion) =>
        error.InnerException is PostgresException postgres && postgres.SqlState == codigo && postgres.ConstraintName == restriccion;
}
