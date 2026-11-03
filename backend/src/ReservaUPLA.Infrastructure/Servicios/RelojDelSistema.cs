using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.Infrastructure.Servicios;

// Implementación real de IReloj: hora del sistema, convertida a la de Perú (UTC-5, sin horario de verano).
internal sealed class RelojDelSistema : IReloj
{
    private static readonly TimeZoneInfo Zona_Peru = TimeZoneInfo.FindSystemTimeZoneById("America/Lima");

    public DateTime AhoraUtc => DateTime.UtcNow;

    public DateTime AhoraEnPeru => TimeZoneInfo.ConvertTimeFromUtc(AhoraUtc, Zona_Peru);
}
