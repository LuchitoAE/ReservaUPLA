using ReservaUPLA.Domain.Comun;

namespace ReservaUPLA.Application.Interfaces;

// La fecha y la hora actuales vienen de afuera: el dominio no lee el reloj del servidor y las reglas
// («la reserva no puede empezar en el pasado») se prueban con cualquier fecha. Entrega un solo instante,
// del que se derivan una sola vez la hora UTC y la de Perú.
public interface IReloj
{
    MomentoActual Ahora { get; }
}
