using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ReservaUPLA.Infrastructure.Persistence;

// Reconoce las restricciones de la base que también son reglas de negocio, para responder con su mensaje
// en lugar de un error 500. Los códigos son los de PostgreSQL (SQLSTATE).
internal static class ErroresDePostgres
{
    private const string Valor_Repetido = "23505";

    public static bool EsValorRepetido(DbUpdateException error, string restriccion) =>
        error.InnerException is PostgresException { SqlState: Valor_Repetido } postgres && postgres.ConstraintName == restriccion;
}
