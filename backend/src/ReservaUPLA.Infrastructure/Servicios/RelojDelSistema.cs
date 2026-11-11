using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Infrastructure.Servicios;

// Implementación real de IReloj: toma un instante UTC y lo entrega como MomentoActual, que deriva una sola vez
// la hora de Perú (UTC-5, sin horario de verano).
internal sealed class RelojDelSistema : IReloj
{
    public MomentoActual Ahora => MomentoActual.Desde(DateTimeOffset.UtcNow);
}
