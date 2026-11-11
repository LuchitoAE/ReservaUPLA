namespace ReservaUPLA.Domain.Comun;

// Un solo instante y las dos lecturas que el dominio necesita, calculadas una sola vez a partir de él: la de UTC
// (lo que se guarda) y la de Perú (lo que decide qué es «hoy» y de qué año es el código). Así una operación nunca
// mezcla dos «ahora» distintos.
public sealed record MomentoActual
{
    private static readonly TimeZoneInfo ZonaPeru = TimeZoneInfo.FindSystemTimeZoneById("America/Lima");

    private MomentoActual(DateTimeOffset instante)
    {
        Instante = instante.ToUniversalTime();
        EnUtc = Instante.UtcDateTime;
        EnPeru = TimeZoneInfo.ConvertTime(Instante, ZonaPeru).DateTime;
    }

    public static MomentoActual Desde(DateTimeOffset instante) => new(instante);

    public DateTimeOffset Instante { get; }

    public DateTime EnUtc { get; }

    public DateTime EnPeru { get; }

    public DateOnly FechaEnPeru => DateOnly.FromDateTime(EnPeru);

    public TimeOnly HoraEnPeru => TimeOnly.FromDateTime(EnPeru);
}
